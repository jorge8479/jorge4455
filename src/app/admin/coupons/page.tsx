"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Ticket,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Clock,
  Users,
  Percent,
  Power,
  PowerOff,
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  description: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  createdAt: string;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountPercent: 10,
    maxUses: 100,
    expiresAt: "",
  });
  const [error, setError] = useState("");

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch {
      setError("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  async function handleCreate() {
    if (!form.code || !form.expiresAt) {
      setError("Code and expiry date required");
      return;
    }
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setCoupons([...coupons, data.coupon]);
      setForm({ code: "", description: "", discountPercent: 10, maxUses: 100, expiresAt: "" });
      setShowCreate(false);
      setError("");
    } catch {
      setError("Failed to create coupon");
    }
  }

  async function handleUpdate(id: string) {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...form }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setCoupons(coupons.map((c) => (c.id === id ? data.coupon : c)));
      setEditing(null);
      setForm({ code: "", description: "", discountPercent: 10, maxUses: 100, expiresAt: "" });
      setError("");
    } catch {
      setError("Failed to update coupon");
    }
  }

  async function handleToggle(id: string, current: boolean) {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current }),
      });
      const data = await res.json();
      if (data.coupon) setCoupons(coupons.map((c) => (c.id === id ? data.coupon : c)));
    } catch {}
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return;
    try {
      await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      setCoupons(coupons.filter((c) => c.id !== id));
    } catch {}
  }

  function startEdit(coupon: Coupon) {
    setEditing(coupon.id);
    setForm({
      code: coupon.code,
      description: coupon.description,
      discountPercent: coupon.discountPercent,
      maxUses: coupon.maxUses,
      expiresAt: coupon.expiresAt.split("T")[0],
    });
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__empty">Loading coupons...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">
            <Ticket size={20} />
            Coupon Management
          </h1>
          <p className="admin-page__subtitle">Create and manage VIP purchase discount coupons</p>
        </div>
        <button
          className="admin-btn admin-btn--primary"
          onClick={() => {
            setShowCreate(!showCreate);
            setEditing(null);
            setForm({ code: "", description: "", discountPercent: 10, maxUses: 100, expiresAt: "" });
          }}
        >
          <Plus size={14} />
          New Coupon
        </button>
      </div>

      {error && (
        <div className="admin-page__error">
          <X size={14} />
          {error}
          <button onClick={() => setError("")}>
            <X size={12} />
          </button>
        </div>
      )}

      {showCreate && (
        <div className="admin-card">
          <h3 className="admin-card__title">Create Coupon</h3>
          <div className="admin-form">
            <div className="admin-form__row">
              <div className="admin-form__field">
                <label>Code</label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER2026"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="admin-input"
                />
              </div>
              <div className="admin-form__field">
                <label>Discount %</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.discountPercent}
                  onChange={(e) => setForm({ ...form, discountPercent: parseInt(e.target.value) || 1 })}
                  className="admin-input"
                />
              </div>
              <div className="admin-form__field">
                <label>Max Uses</label>
                <input
                  type="number"
                  min="1"
                  value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: parseInt(e.target.value) || 1 })}
                  className="admin-input"
                />
              </div>
              <div className="admin-form__field">
                <label>Expires</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="admin-input"
                />
              </div>
            </div>
            <div className="admin-form__field">
              <label>Description</label>
              <input
                type="text"
                placeholder="Optional description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="admin-input"
              />
            </div>
            <div className="admin-form__actions">
              <button className="admin-btn admin-btn--primary" onClick={handleCreate}>
                <Check size={14} /> Create
              </button>
              <button className="admin-btn" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {coupons.length === 0 ? (
        <div className="admin-page__empty">
          <Ticket size={32} />
          <p>No coupons created yet</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Uses</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td>
                    {editing === coupon.id ? (
                      <input
                        type="text"
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                        className="admin-input admin-input--sm"
                      />
                    ) : (
                      <span className="font-mono font-bold text-[var(--admin-accent)]">{coupon.code}</span>
                    )}
                  </td>
                  <td>
                    {editing === coupon.id ? (
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={form.discountPercent}
                        onChange={(e) => setForm({ ...form, discountPercent: parseInt(e.target.value) || 1 })}
                        className="admin-input admin-input--sm"
                      />
                    ) : (
                      <span className="flex items-center gap-1">
                        <Percent size={12} />
                        {coupon.discountPercent}%
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {coupon.usedCount}/{coupon.maxUses}
                    </span>
                  </td>
                  <td>
                    {editing === coupon.id ? (
                      <input
                        type="date"
                        value={form.expiresAt}
                        onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                        className="admin-input admin-input--sm"
                      />
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(coupon.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className={`admin-badge ${coupon.isActive ? "admin-badge--green" : "admin-badge--red"}`}
                      onClick={() => handleToggle(coupon.id, coupon.isActive)}
                    >
                      {coupon.isActive ? <Power size={10} /> : <PowerOff size={10} />}
                      {coupon.isActive ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {editing === coupon.id ? (
                        <>
                          <button className="admin-btn admin-btn--sm admin-btn--green" onClick={() => handleUpdate(coupon.id)}>
                            <Check size={12} />
                          </button>
                          <button className="admin-btn admin-btn--sm" onClick={() => setEditing(null)}>
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="admin-btn admin-btn--sm" onClick={() => startEdit(coupon)}>
                            <Edit3 size={12} />
                          </button>
                          <button className="admin-btn admin-btn--sm admin-btn--red" onClick={() => handleDelete(coupon.id)}>
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
