import { useMemo, useState } from 'react';
import { MapPin, Trash2, Plus } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../contexts/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { expansionAreasApi } from '../../api/expansionAreas';
import { pickLocale } from '../../utils/locale';
import { PageContainer, PageHeader } from '../../components/layout/Navbar';
import { Card, CardBody, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FullPageSpinner } from '../../components/ui/Spinner';
import 'leaflet/dist/leaflet.css';

function ClickCapture({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

const EMPTY_FORM = { name_ar: '', name_en: '', notes: '' };

export default function ExpansionMap() {
  const { locale, t } = useLanguage();
  useDocumentTitle(t('map.title'));
  const toast = useToast();
  const { data, loading, error, refresh } = useAsync(
    () => expansionAreasApi.list(),
    { deps: [] },
  );
  const items = data?.items || [];
  const [draft, setDraft] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const center = useMemo(() => {
    if (draft) return [draft.lat, draft.lng];
    if (items[0]) return [items[0].lat, items[0].lng];
    return [24.7136, 46.6753];
  }, [draft, items]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!draft) {
      toast.error(t('map.clickMap'));
      return;
    }
    setSaving(true);
    try {
      await expansionAreasApi.create({
        name_ar: form.name_ar,
        name_en: form.name_en || undefined,
        lat: draft.lat,
        lng: draft.lng,
        notes: form.notes || undefined,
      });
      toast.success(t('map.saved'));
      setForm(EMPTY_FORM);
      setDraft(null);
      refresh();
    } catch (err) {
      toast.error(err?.message || t('map.title'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await expansionAreasApi.remove(id);
      toast.success(t('map.deleted'));
      refresh();
    } catch (err) {
      toast.error(err?.message || t('common.delete'));
    }
  };

  if (loading && !data) return <FullPageSpinner />;

  return (
    <PageContainer>
      <PageHeader title={t('map.title')} subtitle={t('map.subtitle')} />

      {error && (
        <EmptyState title={error} action={<Button onClick={refresh}>{t('common.retry')}</Button>} />
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="h-[420px] w-full" dir="ltr">
            <MapContainer
              center={center}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ClickCapture onPick={setDraft} />
              {items.map((pin) => (
                <CircleMarker
                  key={pin.id}
                  center={[pin.lat, pin.lng]}
                  radius={9}
                  pathOptions={{ color: '#1f3ff5', fillColor: '#365fff', fillOpacity: 0.85 }}
                >
                  <Popup>
                    <strong>{pickLocale(pin, 'name', locale)}</strong>
                    {pin.notes ? <p>{pin.notes}</p> : null}
                  </Popup>
                </CircleMarker>
              ))}
              {draft && (
                <CircleMarker
                  center={[draft.lat, draft.lng]}
                  radius={9}
                  pathOptions={{ color: '#16A34A', fillColor: '#22C55E', fillOpacity: 0.9 }}
                />
              )}
            </MapContainer>
          </div>
          <p className="px-4 py-2 text-xs text-slate-500">{t('map.clickMap')}</p>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardBody>
              <h3 className="mb-3 flex items-center gap-2 font-bold">
                <Plus size={16} />
                {t('map.add')}
              </h3>
              <form onSubmit={handleSave} className="space-y-3">
                <Input
                  label={t('map.nameAr')}
                  required
                  value={form.name_ar}
                  onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
                />
                <Input
                  label={t('map.nameEn')}
                  value={form.name_en}
                  onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
                />
                <Input
                  label={t('map.notes')}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
                <div className="text-xs text-slate-500">
                  {draft
                    ? `${draft.lat.toFixed(5)}, ${draft.lng.toFixed(5)}`
                    : t('map.clickMap')}
                </div>
                <Button type="submit" loading={saving} disabled={!draft || !form.name_ar}>
                  {t('common.save')}
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              {items.length === 0 ? (
                <EmptyState icon={<MapPin size={32} />} title={t('map.empty')} />
              ) : (
                <ul className="space-y-2">
                  {items.map((pin) => (
                    <li
                      key={pin.id}
                      className="flex items-start justify-between gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800"
                    >
                      <div>
                        <p className="text-sm font-semibold">{pickLocale(pin, 'name', locale)}</p>
                        <p className="text-xs text-slate-500">
                          {Number(pin.lat).toFixed(4)}, {Number(pin.lng).toFixed(4)}
                        </p>
                        {pin.notes && <p className="mt-1 text-xs text-slate-500">{pin.notes}</p>}
                      </div>
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(pin.id)}
                        aria-label={t('common.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
