from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .models import Vendor
from .serializers import VendorSerializer, VendorContactSerializer, VendorAddressSerializer

# ---------- Vendor Statistics ----------
class VendorStatsView(APIView):
    """
    GET /vendor/VendorStats/
    Returns total, active, and inactive vendor counts + list.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vendors = Vendor.objects.all().values("id", "name", "status", "updated_at")

        total_vendors = vendors.count()
        active_vendors = vendors.filter(status="active").count()
        inactive_vendors = vendors.filter(status="inactive").count()

        summary = {
            "total_vendors": total_vendors,
            "active_vendors": active_vendors,
            "inactive_vendors": inactive_vendors,
        }

        return Response(
            {"summary": summary, "vendors": list(vendors)},
            status=status.HTTP_200_OK
        )

@permission_classes([IsAuthenticated])
def add_vendor(request):
    serializer = VendorSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Vendor created successfully", "data": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_vendors(request):
    vendors = Vendor.objects.all().order_by('-created_at')  # latest first
    serializer = VendorSerializer(vendors, many=True)
    return Response({"message": "Vendors retrieved successfully", "data": serializer.data}, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_vendor_by_id(request, vendor_id):
    try:
        vendor = Vendor.objects.get(id=vendor_id)
        serializer = VendorSerializer(vendor)
        return Response({"message": "Vendor retrieved successfully", "data": serializer.data}, status=status.HTTP_200_OK)
    except Vendor.DoesNotExist:
        return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_vendor(request, vendor_id):
    try:
        vendor = Vendor.objects.get(id=vendor_id)
    except Vendor.DoesNotExist:
        return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = VendorSerializer(vendor, data=request.data, partial=True)  # partial=True allows PATCH
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Vendor updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_vendor(request, vendor_id):
    try:
        vendor = Vendor.objects.get(id=vendor_id)
        vendor.delete()
        return Response({"message": "Vendor deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    except Vendor.DoesNotExist:
        return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_vendor_contact(request, vendor_id):
    try:
        vendor = Vendor.objects.get(id=vendor_id)
    except Vendor.DoesNotExist:
        return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

    data = request.data.copy()
    data['vendor'] = vendor.id  # link contact to vendor

    serializer = VendorContactSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Contact added successfully", "data": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_vendor_contacts(request, vendor_id):
    try:
        vendor = Vendor.objects.get(id=vendor_id)
    except Vendor.DoesNotExist:
        return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

    contacts = vendor.contacts.all().order_by('-created_at')  # latest first
    serializer = VendorContactSerializer(contacts, many=True)
    return Response({"message": "Contacts retrieved successfully", "data": serializer.data}, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_vendor_contact(request):
    vendor_id = request.data.get("vendor_id")
    contact_id = request.data.get("contact_id")

    if not vendor_id or not contact_id:
        return Response({"error": "vendor_id and contact_id are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        vendor = Vendor.objects.get(id=vendor_id)
    except Vendor.DoesNotExist:
        return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        contact = vendor.contacts.get(id=contact_id)
    except Exception:
        return Response({"error": "Contact not found for this vendor"}, status=status.HTTP_404_NOT_FOUND)

    serializer = VendorContactSerializer(contact, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Contact updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_vendor_contact(request):
    vendor_id = request.data.get("vendor_id")
    contact_id = request.data.get("contact_id")

    if not vendor_id or not contact_id:
        return Response({"error": "vendor_id and contact_id are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        vendor = Vendor.objects.get(id=vendor_id)
    except Vendor.DoesNotExist:
        return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        contact = vendor.contacts.get(id=contact_id)
    except Exception:
        return Response({"error": "Contact not found for this vendor"}, status=status.HTTP_404_NOT_FOUND)

    contact.delete()
    return Response({"message": "Contact deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


# ---------- Vendor Addresses ----------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_vendor_address(request):
    vendor_id = request.data.get("vendor_id")
    if not vendor_id:
        return Response({"error": "vendor_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        vendor = Vendor.objects.get(id=vendor_id)   # ORM
    except Vendor.DoesNotExist:
        return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

    data = request.data.copy()
    data['vendor'] = vendor.id  # link address to vendor

    serializer = VendorAddressSerializer(data=data)   # DRF
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Address added successfully", "data": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])  # using POST since we’re passing vendor_id in body
@permission_classes([IsAuthenticated])
def get_vendor_addresses(request):
    vendor_id = request.data.get("vendor_id")
    if not vendor_id:
        return Response({"error": "vendor_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        vendor = Vendor.objects.get(id=vendor_id)   # ORM
    except Vendor.DoesNotExist:
        return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

    addresses = vendor.addresses.all().order_by('-created_at')   # ORM
    serializer = VendorAddressSerializer(addresses, many=True)   # DRF
    return Response({"message": "Addresses retrieved successfully", "data": serializer.data}, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_vendor_address(request):
    vendor_id = request.data.get("vendor_id")
    address_id = request.data.get("address_id")

    if not vendor_id or not address_id:
        return Response({"error": "vendor_id and address_id are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        vendor = Vendor.objects.get(id=vendor_id)   # ORM
    except Vendor.DoesNotExist:
        return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        address = vendor.addresses.get(id=address_id)   # ORM
    except Exception:
        return Response({"error": "Address not found for this vendor"}, status=status.HTTP_404_NOT_FOUND)

    serializer = VendorAddressSerializer(address, data=request.data, partial=True)   # DRF
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Address updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_vendor_address(request):
    vendor_id = request.data.get("vendor_id")
    address_id = request.data.get("address_id")

    if not vendor_id or not address_id:
        return Response({"error": "vendor_id and address_id are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        vendor = Vendor.objects.get(id=vendor_id)   # ORM
    except Vendor.DoesNotExist:
        return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        address = vendor.addresses.get(id=address_id)   # ORM
    except Exception:
        return Response({"error": "Address not found for this vendor"}, status=status.HTTP_404_NOT_FOUND)

    address.delete()
    return Response({"message": "Address deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

