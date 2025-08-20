from rest_framework import serializers
from .models import Client, ClientVendorLink, Vendor

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ['id', 'name', 'designation', 'phone', 'email', 'role']

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ('id', 'created_at')

class ClientVendorLinkSerializer(serializers.ModelSerializer):
    vendor = VendorSerializer(read_only=True)  # Nested Vendor details

    class Meta:
        model = ClientVendorLink
        fields = ['id', 'role', 'created_at', 'client', 'vendor']