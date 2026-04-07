from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core_api.permissions import IsAdminRole

from .models import AuditLog, SystemSetting


class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = ('key', 'value', 'updated_by', 'updated_at')
        read_only_fields = ('updated_by', 'updated_at')


class AdminSettingsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        rows = SystemSetting.objects.all().order_by('key')
        return Response(SystemSettingSerializer(rows, many=True).data)

    def patch(self, request):
        payload = request.data if isinstance(request.data, list) else [request.data]
        out = []
        for item in payload:
            key = item.get('key')
            if not key:
                continue
            row, _ = SystemSetting.objects.get_or_create(key=key)
            row.value = item.get('value', {})
            row.updated_by = request.user
            row.save()
            out.append(row)
            AuditLog.objects.create(
                actor=request.user,
                action='admin_setting_patch',
                resource='system_setting',
                resource_id=key,
                detail={'value': row.value},
            )
        return Response(SystemSettingSerializer(out, many=True).data)


class AdminAuditListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        limit = min(int(request.query_params.get('limit', 100)), 500)
        rows = AuditLog.objects.select_related('actor').order_by('-created_at')[:limit]
        return Response(
            [
                {
                    'id': r.id,
                    'actor_id': str(r.actor_id) if r.actor_id else None,
                    'action': r.action,
                    'resource': r.resource,
                    'resource_id': r.resource_id,
                    'detail': r.detail,
                    'created_at': r.created_at,
                }
                for r in rows
            ]
        )
