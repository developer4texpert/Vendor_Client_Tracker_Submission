from rest_framework import serializers
from .models import Client, ClientVendorLink, ClientAddress
from vendors.models import Vendor as ExternalVendor

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalVendor  # <- use the imported ExternalVendor
        # Keep fields aligned to what /vendor/GetVendor/ returns
        fields = [
            'id', 'name',
            'street_address', 'city', 'state', 'country', 'zipcode',
            'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at')


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ('id', 'created_at')

class ClientAddressSerializer(serializers.ModelSerializer):
    addrid = serializers.IntegerField(source="id", read_only=True)

    class Meta:
        model = ClientAddress
        fields = [
            "addrid",
            "client",
            "street_address",
            "city",
            "state",
            "country",
            "zipcode",
            "address_type",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("addrid", "created_at", "updated_at")

class ClientVendorLinkSerializer(serializers.ModelSerializer):
    vendor = VendorSerializer(read_only=True)  # Nested Vendor details

    class Meta:
        model = ClientVendorLink
        fields = ['id', 'role', 'created_at', 'client', 'vendor']


# ✅ New: serializer for the attach payload
class AttachVendorRequestSerializer(serializers.Serializer):
    vendor_id = serializers.IntegerField()
    role = serializers.ChoiceField(choices=[c[0] for c in ClientVendorLink.ROLE_CHOICES])