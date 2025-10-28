from rest_framework import serializers
from .models import Skill, Visa, Consultant, ConsultantAddress, ConsultantEducation, Submission

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']


class VisaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visa
        fields = ['id', 'name']

class ConsultantAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultantAddress
        fields = ['street', 'city', 'state', 'zipcode']


class ConsultantEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultantEducation
        fields = ['type', 'university_name', 'major', 'year_of_completion']


class ConsultantSerializer(serializers.ModelSerializer):
    address = ConsultantAddressSerializer(required=False)
    education = ConsultantEducationSerializer(many=True, required=False)

    class Meta:
        model = Consultant
        fields = [
            'id', 'email', 'first_name', 'middle_name', 'last_name', 'dob', 'ssn',
            'phone_number', 'other_phone_number', 'skype_id', 'skill', 'expected_rate',
            'visa_status', 'passport_number', 'exp', 'gk', 'gk_move_in_date',
            'us_entry_date', 'recruiter', 'active', 'street_address', 'pref_location',
            'priority', 'address', 'education'
        ]

    def create(self, validated_data):
        address_data = validated_data.pop('address', None)
        education_data = validated_data.pop('education', [])
        consultant = Consultant.objects.create(**validated_data)
        if address_data:
            ConsultantAddress.objects.create(consultant=consultant, **address_data)
        for edu in education_data:
            ConsultantEducation.objects.create(consultant=consultant, **edu)
        return consultant

    def update(self, instance, validated_data):
        address_data = validated_data.pop('address', None)
        education_data = validated_data.pop('education', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if address_data:
            ConsultantAddress.objects.update_or_create(consultant=instance, defaults=address_data)
        if education_data:
            instance.education.all().delete()
            for edu in education_data:
                ConsultantEducation.objects.create(consultant=instance, **edu)
        return instance

class SubmissionSerializer(serializers.ModelSerializer):
    consultant_name = serializers.CharField(source='consultant.first_name', read_only=True)
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    prime_vendor_name = serializers.CharField(source='prime_vendor.name', read_only=True)
    implementation_partner_name = serializers.CharField(source='implementation_partner.name', read_only=True)
    end_client_name = serializers.CharField(source='end_client.name', read_only=True)
    marketer_name = serializers.CharField(source='marketer.username', read_only=True)
    skill_name = serializers.CharField(source='skill.name', read_only=True)

    class Meta:
        model = Submission
        fields = [
            'id',
            'consultant',
            'consultant_name',
            'vendor',
            'vendor_name',
            'prime_vendor',
            'prime_vendor_name',
            'implementation_partner',
            'implementation_partner_name',
            'end_client',
            'end_client_name',
            'marketer',
            'marketer_name',
            'skill',
            'skill_name',
            'submission_date',
            'comments',
            'vendor_response',
            'resume_passed_to_client',
            'is_duplicate',
        ]