# serializers.py
from rest_framework import serializers

class ScaleValuesSerializer(serializers.Serializer):
    scale_values = serializers.ListField(child=serializers.FloatField())
