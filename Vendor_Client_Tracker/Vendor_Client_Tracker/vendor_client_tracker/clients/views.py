# clients/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .domain_constants import DOMAIN_CHOICES


from .models import Client, ClientVendorLink, ClientAddress
from vendors.models import Vendor as Vendor

from .serializers import (
    ClientSerializer,
    ClientAddressSerializer,
    ClientVendorLinkSerializer,
    AttachVendorRequestSerializer,
    VendorSerializer
)

class SearchClientView(APIView):
    """
    POST /clients/SearchClient/
    Filter clients by City, State, and Vendor (name or id).

    Example Body:
    {
        "city": "Dallas",
        "state": "TX",
        "vendor_name": "TechConnect"
    }
    """

    def post(self, request):
        data = request.data
        clients = Client.objects.all()

        # 🔹 Filter by City
        city = data.get('city')
        if city:
            clients = clients.filter(city__icontains=city)

        # 🔹 Filter by State
        state = data.get('state')
        if state:
            clients = clients.filter(state__icontains=state)

        # 🔹 Filter by Vendor (using link table)
        vendor_id = data.get('vendor_id')
        vendor_name = data.get('vendor_name')

        if vendor_id or vendor_name:
            vendor_links = ClientVendorLink.objects.all()

            if vendor_id:
                vendor_links = vendor_links.filter(vendor_id=vendor_id)
            if vendor_name:
                vendor_links = vendor_links.filter(vendor__name__icontains=vendor_name)

            client_ids = vendor_links.values_list('client_id', flat=True).distinct()
            clients = clients.filter(id__in=client_ids)

        serializer = ClientSerializer(clients.distinct(), many=True)
        return Response({
            "count": clients.count(),
            "results": serializer.data
        }, status=status.HTTP_200_OK)

class DomainListAPI(APIView):
    def get(self, request):
        data = [{"id": i + 1, "name": d} for i, d in enumerate(DOMAIN_CHOICES)]
        return Response(data)

class AddClientView(APIView):
    def post(self, request):
        data = request.data.copy()  # make a mutable copy
        domain_id = data.get("domain_id")

        # Map domain_id → domain_name
        if domain_id:
            try:
                domain_id = int(domain_id)
                if 1 <= domain_id <= len(DOMAIN_CHOICES):
                    data["domain_name"] = DOMAIN_CHOICES[domain_id - 1]
                else:
                    return Response({"error": "Invalid domain_id"}, status=status.HTTP_400_BAD_REQUEST)
            except ValueError:
                return Response({"error": "domain_id must be an integer"}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Use modified `data` instead of request.data
        serializer = ClientSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetClientView(APIView):
    def get(self, request):
        clients = Client.objects.all()
        serializer = ClientSerializer(clients, many=True)
        return Response(serializer.data)


class GetClientByIDView(APIView):
    def get(self, request, pk):
        client = get_object_or_404(Client, pk=pk)
        serializer = ClientSerializer(client)
        return Response(serializer.data)


class UpdateClientView(APIView):
    def put(self, request, pk):
        client = get_object_or_404(Client, pk=pk)
        serializer = ClientSerializer(client, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteClientView(APIView):
    def delete(self, request, pk):
        client = get_object_or_404(Client, pk=pk)
        client.delete()
        return Response({"message": "Client deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    
# 1️⃣ Add Client Address
class AddClientAddressView(APIView):
    def post(self, request):
        serializer = ClientAddressSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 2️⃣ Get Client Addresses (pass client_id in body)
class GetClientAddressesView(APIView):
    def post(self, request):
        client_id = request.data.get("client_id")
        if not client_id:
            return Response({"error": "client_id is required"}, status=400)
        addresses = ClientAddress.objects.filter(client_id=client_id)
        serializer = ClientAddressSerializer(addresses, many=True)
        return Response(serializer.data, status=200)


# ✅ Update Client Address (via request body)
class UpdateClientAddressView(APIView):
    def put(self, request):
        addrid = request.data.get("addrid")
        if not addrid:
            return Response({"error": "addrid is required"}, status=400)

        try:
            address = ClientAddress.objects.get(pk=addrid)
        except ClientAddress.DoesNotExist:
            return Response({"error": "Address not found"}, status=404)

        serializer = ClientAddressSerializer(address, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)


# ✅ Delete Client Address (via request body)
class DeleteClientAddressView(APIView):
    def delete(self, request):
        addrid = request.data.get("addrid")
        if not addrid:
            return Response({"error": "addrid is required"}, status=400)

        try:
            address = ClientAddress.objects.get(pk=addrid)
        except ClientAddress.DoesNotExist:
            return Response({"error": "Address not found"}, status=404)

        address.delete()
        return Response({"message": "Address deleted successfully"}, status=200)




class AttachVendorToClientView(APIView):
    def post(self, request, client_id):
        client = get_object_or_404(Client, id=client_id)

        payload = AttachVendorRequestSerializer(data=request.data)
        if not payload.is_valid():
            return Response(payload.errors, status=status.HTTP_400_BAD_REQUEST)

        vendor_id = payload.validated_data["vendor_id"]
        role = payload.validated_data["role"]

        vendor = get_object_or_404(Vendor, id=vendor_id)  # <- look up in external table

        link, created = ClientVendorLink.objects.get_or_create(
            client=client, vendor=vendor, role=role
        )

        if not created:
            return Response({"message": "Vendor already attached to this client with the same role"}, status=200)

        return Response(ClientVendorLinkSerializer(link).data, status=201)


class GetVendorsForClientView(APIView):
    def get(self, request, client_id):
        client = get_object_or_404(Client, id=client_id)
        links = (ClientVendorLink.objects
                 .filter(client=client)
                 .select_related("vendor")
                 .order_by("-created_at"))

        flat = request.query_params.get("flat") == "true"
        if flat:
            from .serializers import VendorSerializer
            vendors = [l.vendor for l in links]
            return Response(
                {"message": "Vendors retrieved successfully",
                 "client_id": client.id,
                 "count": len(vendors),
                 "data": VendorSerializer(vendors, many=True).data},
                status=200
            )

        return Response(
            {"message": "Client vendors retrieved successfully",
             "client_id": client.id,
             "count": links.count(),
             "data": ClientVendorLinkSerializer(links, many=True).data},
            status=200
        )


class DetachVendorFromClientView(APIView):
    def delete(self, request, client_id, vendor_id):
        client = get_object_or_404(Client, id=client_id)
        vendor = get_object_or_404(Vendor, id=vendor_id)  # external

        link = ClientVendorLink.objects.filter(client=client, vendor=vendor).first()
        if not link:
            return Response({"error": "Vendor not attached to this client"}, status=400)

        link.delete()
        return Response({"message": "Vendor detached successfully"}, status=200)


class ClientStatisticsView(APIView):
    def get(self, request):
        total_clients = Client.objects.count()
        clients_with_vendors = ClientVendorLink.objects.values('client').distinct().count()
        clients_without_vendors = total_clients - clients_with_vendors

        stats = {
            "total_clients": total_clients,
            "clients_with_vendors": clients_with_vendors,
            "clients_without_vendors": clients_without_vendors
        }
        return Response(stats, status=status.HTTP_200_OK)


# (Optional) Handy list view to verify Vendor IDs exist where you're attaching from
class GetVendorView(APIView):
    def get(self, request):
        vendors = Vendor.objects.all().order_by('-updated_at', '-created_at')
        return Response({
            "message": "Vendors retrieved successfully",
            "data": VendorSerializer(vendors, many=True).data
        }, status=status.HTTP_200_OK)
