import { useState, useEffect } from 'react';
import api from '../../services/api';
import './ModalNuevoActivo.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Para recargar la tabla después de guardar
}

interface Ubicacion {
  id: number;
  nombre: string;
  Establecimiento?: { nombre: string };
}

export default function ModalNuevoActivo({ isOpen, onClose, onSuccess }: ModalProps) {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    codigo_patrimonial: '',
    descripcion: '',
    categoria: '',
    estado_conservacion: 'bueno',
    valor: '',
    ubicacion_id: ''
  });

  useEffect(() => {
    if (isOpen) {
      // Cargar las ubicaciones cuando se abre el modal
      api.get('/api/ubicaciones')
        .then(res => setUbicaciones(res.data))
        .catch(() => setError('Error al cargar las ubicaciones'));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/api/activos', {
        ...formData,
        valor: formData.valor ? parseInt(formData.valor) : 0,
        ubicacion_id: parseInt(formData.ubicacion_id)
      });
      
      // Limpiar formulario y cerrar
      setFormData({ codigo_patrimonial: '', descripcion: '', categoria: '', estado_conservacion: 'bueno', valor: '', ubicacion_id: '' });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al guardar el activo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Registrar Nuevo Activo</h2>
          <button className="btn-cerrar" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>Código Patrimonial <span>*</span></label>
              <div className="input-wrapper">
                <input type="text" name="codigo_patrimonial" required value={formData.codigo_patrimonial} onChange={handleChange} placeholder="Ej: INV-2026-001" />
              </div>
            </div>

            <div className="form-group">
              <label>Descripción del Bien <span>*</span></label>
              <div className="input-wrapper">
                <input type="text" name="descripcion" required value={formData.descripcion} onChange={handleChange} placeholder="Ej: Proyector Epson X100" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Categoría <span>*</span></label>
                <div className="input-wrapper">
                  <input type="text" name="categoria" required value={formData.categoria} onChange={handleChange} placeholder="Ej: Electrónica" />
                </div>
              </div>
              
              <div className="form-group">
                <label>Valor Estimado ($)</label>
                <div className="input-wrapper">
                  <input type="number" name="valor" min="0" value={formData.valor} onChange={handleChange} placeholder="Ej: 250000" />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Estado <span>*</span></label>
                <select name="estado_conservacion" value={formData.estado_conservacion} onChange={handleChange} required>
                  <option value="nuevo">Nuevo</option>
                  <option value="bueno">Bueno</option>
                  <option value="regular">Regular</option>
                  <option value="malo">Malo</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ubicación <span>*</span></label>
                <select name="ubicacion_id" value={formData.ubicacion_id} onChange={handleChange} required>
                  <option value="">Seleccione un espacio...</option>
                  {ubicaciones.map(ub => (
                    <option key={ub.id} value={ub.id}>
                      {ub.Establecimiento?.nombre} - {ub.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancelar" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primario" disabled={loading}>
              {loading ? 'Guardando...' : 'Registrar Activo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
