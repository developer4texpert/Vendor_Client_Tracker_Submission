from rest_framework import serializers
from .models import Vendor, VendorAddress, VendorContact

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = '__all__'

class VendorAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorAddress
        fields = "__all__"

class VendorContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorContact
        fields = '__all__'