from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Vendor
from .serializers import VendorSerializer, VendorContactSerializer

@api_view(['POST'])
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