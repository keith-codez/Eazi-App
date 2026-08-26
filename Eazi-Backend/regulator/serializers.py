from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from .models import Customer, Agency, Agent

User = get_user_model()


class CustomerMiniSerializer(serializers.ModelSerializer):
    """Lightweight customer representation for embedding in staff/booking views."""
    class Meta:
        model = Customer
        fields = ['id', 'first_name', 'last_name', 'email', 'phone_number']


class CustomerSerializer(serializers.ModelSerializer):
    """Full customer profile management serializer."""
    title = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    email = serializers.EmailField(required=False, allow_null=True)
    national_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    drivers_license = serializers.ImageField(required=False, allow_null=True)

    next_of_kin1_first_name = serializers.CharField(required=False, allow_blank=True)
    next_of_kin1_last_name = serializers.CharField(required=False, allow_blank=True)
    next_of_kin1_id_number = serializers.CharField(required=False, allow_blank=True)
    next_of_kin1_phone = serializers.CharField(required=False, allow_blank=True)

    next_of_kin2_first_name = serializers.CharField(required=False, allow_blank=True)
    next_of_kin2_last_name = serializers.CharField(required=False, allow_blank=True)
    next_of_kin2_id_number = serializers.CharField(required=False, allow_blank=True)
    next_of_kin2_phone = serializers.CharField(required=False, allow_blank=True)

    last_booking_date = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = Customer
        exclude = ['agents', 'related_agency']

    def validate_national_id(self, value):
        customer_id = self.instance.id if self.instance else None
        if value and Customer.objects.exclude(id=customer_id).filter(national_id=value).exists():
            raise serializers.ValidationError("Customer with this National ID already exists.")
        return value


class CustomerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    phone_number = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'phone_number', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        phone_number = validated_data.pop('phone_number')

        user = User(**validated_data)
        user.set_password(password)
        user.role = 'customer'
        user.save()

        Customer.objects.create(
            user=user,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            phone_number=phone_number,
            national_id="",
            next_of_kin1_first_name="",
            next_of_kin1_last_name="",
            next_of_kin1_id_number="",
            next_of_kin1_phone="",
        )

        return user


class AgentRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.role = 'agent'
        user.save()

        Agent.objects.create(
            user=user, 
            first_name=validated_data['first_name'], 
            last_name=validated_data['last_name']
        )
        return user


class AgencyRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    name = serializers.CharField()

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'name']

    def create(self, validated_data):
        agency_name = validated_data.pop('name')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role='agency'
        )
        Agency.objects.create(name=agency_name, created_by=user)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        username_or_email = data['username']
        password = data['password']

        if '@' in username_or_email:
            try:
                user_obj = User.objects.get(email=username_or_email)
                username = user_obj.username
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid credentials")
        else:
            username = username_or_email

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials")

        return user


class AgencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Agency
        fields = "__all__"


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = "__all__"