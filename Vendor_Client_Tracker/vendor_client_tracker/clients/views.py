from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Client
from .serializers import ClientSerializer
from django.shortcuts import get_object_or_404
from django.db.models import Q 
from .models import Vendor, ClientVendorLink
from .serializers import ClientVendorLinkSerializer

class AddClientView(APIView):
    def post(self, request):
        serializer = ClientSerializer(data=request.data)
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
        serializer = ClientSerializer(client, data=request.data, partial=True)  # partial=True → allows updating only some fields
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteClientView(APIView):
    def delete(self, request, pk):
        client = get_object_or_404(Client, pk=pk)
        client.delete()
        return Response({"message": "Client deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    
class SearchClientView(APIView):
    def get(self, request):
        query = request.query_params.get('query', None)
        if query:
            clients = Client.objects.filter(
                Q(name__icontains=query) |
                Q(city__icontains=query) |
                Q(contact_name__icontains=query) |
                Q(contact_email__icontains=query)
            )
        else:
            clients = Client.objects.all()

        serializer = ClientSerializer(clients, many=True)
        return Response(serializer.data)


class AttachVendorToClientView(APIView):
    def post(self, request, client_id):
        try:
            client = Client.objects.get(id=client_id)
        except Client.DoesNotExist:
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)

        vendor_id = request.data.get("vendor_id")
        role = request.data.get("role")

        if not vendor_id or not role:
            return Response({"error": "vendor_id and role are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            vendor = Vendor.objects.get(id=vendor_id)
        except Vendor.DoesNotExist:
            return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

        link, created = ClientVendorLink.objects.get_or_create(
            client=client, vendor=vendor, role=role
        )

        if not created:
            return Response({"message": "Vendor already attached to this client with the same role"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ClientVendorLinkSerializer(link)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class GetVendorsForClientView(APIView):
    def get(self, request, client_id):
        try:
            client = Client.objects.get(id=client_id)
        except Client.DoesNotExist:
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)

        links = ClientVendorLink.objects.filter(client=client)
        serializer = ClientVendorLinkSerializer(links, many=True)
        return Response(serializer.data)

class DetachVendorFromClientView(APIView):
    def delete(self, request, client_id, vendor_id):
        try:
            client = Client.objects.get(id=client_id)
        except Client.DoesNotExist:
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            vendor = Vendor.objects.get(id=vendor_id)
        except Vendor.DoesNotExist:
            return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

        # Remove link from ClientVendorLink table
        link = ClientVendorLink.objects.filter(client=client, vendor=vendor).first()
        if not link:
            return Response({"error": "Vendor not attached to this client"}, status=status.HTTP_400_BAD_REQUEST)

        link.delete()
        return Response({"message": "Vendor detached successfully"}, status=status.HTTP_200_OK)

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