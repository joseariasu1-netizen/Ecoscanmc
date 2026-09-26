import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  ThumbsUp,
  Search,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { CitizenReport, ReportStatus, ReportUrgency } from '../types';

interface CitizenReportsViewProps {
  reports: CitizenReport[];
  onOpenReportModal: () => void;
  onUpdateReportStatus: (id: string, newStatus: ReportStatus, note?: string) => void;
  onUpvoteReport: (id: string) => void;
}

export const CitizenReportsView: React.FC<CitizenReportsViewProps> = ({
  reports,
  onOpenReportModal,
  onUpdateReportStatus,
  onUpvoteReport,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterUrgency, setFilterUrgency] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReportForAction, setSelectedReportForAction] = useState<CitizenReport | null>(null);
  const [actionStatus, setActionStatus] = useState<ReportStatus>('en_ruta');
  const [actionNote, setActionNote] = useState<string>('');

  const filteredReports = reports.filter((report) => {
    if (filterStatus !== 'todos' && report.status !== filterStatus) return false;
    if (filterUrgency !== 'todas' && report.urgency !== filterUrgency) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        report.address.toLowerCase().includes(q) ||
        report.categoryLabel.toLowerCase().includes(q) ||
        report.ticketCode.toLowerCase().includes(q) ||
        report.notes.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const countPending = reports.filter((r) => r.status === 'pendiente').length;
  const countInRoute = reports.filter((r) => r.status === 'en_ruta' || r.status === 'en_revision').length;
  const countResolved = reports.filter((r) => r.status === 'recolectado').length;

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Pendiente</span>
          </span>
        );
      case 'en_revision':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <ShieldCheck className="w-3 h-3" />
            <span>En Revisión</span>
          </span>
        );
      case 'en_ruta':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
            <Truck className="w-3 h-3" />
            <span>En Ruta Cuadrilla</span>
          </span>
        );
      case 'recolectado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Recolectado / Limpio</span>
          </span>
        );
    }
  };

  const getUrgencyBadge = (urgency: ReportUrgency) => {
    switch (urgency) {
      case 'critica':
        return <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-600 text-white uppercase">Crítica</span>;
      case 'alta':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500 text-white uppercase">Alta</span>;
      case 'media':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 uppercase">Media</span>;
      case 'baja':
        return <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">Baja</span>;
    }
  };

  const handleApplyStatusChange = () => {
    if (!selectedReportForAction) return;
    onUpdateReportStatus(selectedReportForAction.id, actionStatus, actionNote);
    setSelectedReportForAction(null);
    setActionNote('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner with Stats and New Report Action */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md shadow-slate-200/40 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full text-xs font-bold text-amber-800 border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Vigilancia y Reporte Ciudadano</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Puntos Críticos de Basura en Vía Pública
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm max-w-xl">
              Monitoreo comunitario en tiempo real para erradicar basureros clandestinos, escombros y contenedores colapsados.
            </p>
          </div>

          <button
            id="btn-open-create-report"
            onClick={onOpenReportModal}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-transform active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Nuevo Reporte</span>
          </button>
        </div>

        {/* Metric Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Reportes
            </span>
            <span className="text-2xl font-black text-slate-900">{reports.length}</span>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              Pendientes
            </span>
            <span className="text-2xl font-black text-amber-900">{countPending}</span>
          </div>

          <div className="bg-purple-50/70 border border-purple-200 p-3.5 rounded-2xl">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
              En Ruta Cuadrilla
            </span>
            <span className="text-2xl font-black text-purple-900">{countInRoute}</span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-2xl">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Recolectados / Limpios
            </span>
            <span className="text-2xl font-black text-emerald-900">{countResolved}</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por dirección, ticket o tipo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status and Urgency filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            {['todos', 'pendiente', 'en_ruta', 'recolectado'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  filterStatus === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'todos' ? 'Todos' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shrink-0"
          >
            <option value="todas">Toda Urgencia</option>
            <option value="critica">Crítica</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
      </div>

      {/* Reports List Cards */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No se encontraron reportes con los filtros seleccionados
          </h3>
          <p className="text-xs text-slate-500">
            Intenta cambiar los filtros de búsqueda o registra un nuevo punto crítico.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-md shadow-slate-100 overflow-hidden flex flex-col justify-between hover:border-emerald-300 transition-all group"
            >
              <div>
                {/* Photo and Status header */}
                <div className="relative aspect-video max-h-48 overflow-hidden bg-slate-100">
                  <img
                    src={report.photoUrl}
                    alt={report.categoryLabel}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {getStatusBadge(report.status)}
                    {getUrgencyBadge(report.urgency)}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/75 backdrop-blur-sm rounded-lg text-white font-mono text-[11px] font-bold">
                    {report.ticketCode}
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-white text-[10px]">
                    {new Date(report.createdAt).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 line-clamp-1">
                      {report.categoryLabel}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="line-clamp-1">{report.address}</span>
                    </div>
                    {report.reference && (
                      <span className="text-[11px] text-slate-400 block ml-5">
                        Ref: {report.reference}
                      </span>
                    )}
                  </div>

                  {report.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 line-clamp-2">
                      "{report.notes}"
                    </p>
                  )}

                  {/* Resolution note if resolved */}
                  {report.status === 'recolectado' && report.resolutionNote && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Resolución de Cuadrilla de Aseo:</span>
                      </div>
                      <p className="text-xs text-emerald-800">{report.resolutionNote}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action footer */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  id={`btn-upvote-${report.id}`}
                  onClick={() => onUpvoteReport(report.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition-colors shadow-2xs"
                  title="Apoyar este reporte para aumentar prioridad comunitaria"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{report.upvotes || 1} Apoyos</span>
                </button>

                {/* Admin/Squad Status Action button */}
                <button
                  id={`btn-manage-${report.id}`}
                  onClick={() => {
                    setSelectedReportForAction(report);
                    setActionStatus(report.status);
                    setActionNote(report.resolutionNote || '');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                >
                  <span>Gestionar Estado</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin/Squad Status Update Modal */}
      {selectedReportForAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">
                Actualizar Estado de Reporte ({selectedReportForAction.ticketCode})
              </h3>
              <button
                onClick={() => setSelectedReportForAction(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                  Nuevo Estado de Cuadrilla:
                </label>
                <select
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value as ReportStatus)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="pendiente">⏳ Pendiente de Programación</option>
                  <option value="en_revision">🔍 En Revisión por Inspector</option>
                  <option value="en_ruta">🚛 En Ruta con Camión Recolector</option>
                  <option value="recolectado">✅ Recolectado y Sitio Limpio</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                  Nota de Cuadrilla / Comprobante de Limpieza:
                </label>
                <textarea
                  rows={3}
                  placeholder="Ej. Se retiraron 200 kg de escombros y se desinfectó la acera..."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setSelectedReportForAction(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                id="btn-confirm-status-update"
                onClick={handleApplyStatusChange}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
              >
                Guardar Actualización
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
