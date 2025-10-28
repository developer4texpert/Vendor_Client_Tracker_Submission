from rest_framework import serializers
from .models import Marketer, Recruiter

class MarketerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marketer
        fields = '__all__'


class RecruiterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recruiter
        fields = '__all__'
