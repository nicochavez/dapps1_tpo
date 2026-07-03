import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';

import Header from '../components/Header';
import Footer from '../components/Footer';
import ItemDetailLiveView from '../components/ItemDetailLiveView';
import ItemDetailUpcomingView from '../components/ItemDetailUpcomingView';
import ItemDetailEndedView from '../components/ItemDetailEndedView';

import { AuthContext } from '../context/AuthContext';
import { getProductoById, getItemCatalogoDetalle, getHistorialPujas, getMultas, getMediosPago, buildImageUrl } from '../services/api';

// ─── Regla de negocio de categorías ─────────────────────────────────────────
// Misma tabla que CatalogItemsScreen — mantener sincronizadas.
const CATEGORY_RANK = {
  comun:    0,
  especial: 1,
  plata:    2, silver:   2,
  oro:      3, gold:     3,
  platino:  4, platinum: 4,
  admin:    99,
};

const hasEnoughCategory = (userCategory, catalogCategory) => {
  const userRank     = CATEGORY_RANK[userCategory?.toLowerCase()]    ?? -1;
  const requiredRank = CATEGORY_RANK[catalogCategory?.toLowerCase()] ?? 0;
  return userRank >= requiredRank;
};
// ────────────────────────────────────────────────────────────────────────────

// Mapea una puja del historial (backend) al shape que usan las vistas de pujas.
function mapBid(p) {
  return {
    id: p.identificador,
    numeroPostor: p.numeroPostor,
    importe: Number(p.importe),
    fecha: p.timestamp,
    ganador: p.ganador === 'si',
  };
}

// ── Detalle unificado de un item de catálogo ─────────────────────────────────
// Único punto que decide el estado del item: trae el detalle real (con estadoLote
// del backend) + el historial de pujas, calcula acceso/dueño y renderiza la vista
// Live/Upcoming/Ended. Lo usan TANTO el camino del catálogo como el de MyAuctions,
// así el mismo item se ve igual sin importar por dónde se entre.
const BIDS_POLL_MS = 5000;

function CatalogItemDetail({
  catalogoId, itemId, subastaId, subastaInfo, estadoLote: estadoLoteHint,
  catalogDescripcion, catalogImage, won,
  currentUser, navigation,
}) {
  const [detail, setDetail] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidTick, setBidTick] = useState(0);
  const [hasPendingMulta, setHasPendingMulta] = useState(false);
  const [hasVerifiedPayment, setHasVerifiedPayment] = useState(false);

  // ── Multas del usuario: si tiene alguna pendiente, no puede pujar (regla de negocio) ──
  useEffect(() => {
    if (!currentUser?.token) { setHasPendingMulta(false); return; }
    let cancel = false;
    getMultas(currentUser.token)
      .then(ms => { if (!cancel) setHasPendingMulta((ms || []).some(m => m.estado === 'pendiente')); })
      .catch(() => { if (!cancel) setHasPendingMulta(false); });
    return () => { cancel = true; };
  }, [currentUser?.token]);

  // ── Medios de pago: para pujar se necesita al menos uno verificado y vigente en la
  //    moneda de la subasta (si se conoce la moneda). Espeja la regla del backend. ──
  const subastaMoneda = subastaInfo?.moneda;
  useEffect(() => {
    if (!currentUser?.token) { setHasVerifiedPayment(false); return; }
    let cancel = false;
    getMediosPago(currentUser.token)
      .then(ms => {
        if (cancel) return;
        const ok = (ms || []).some(m =>
          m.verificado && m.vigente !== false &&
          (!subastaMoneda || (m.moneda || '').toUpperCase() === subastaMoneda.toUpperCase()));
        setHasVerifiedPayment(ok);
      })
      .catch(() => { if (!cancel) setHasVerifiedPayment(false); });
    return () => { cancel = true; };
  }, [currentUser?.token, subastaMoneda]);
  const detailLoadedRef = useRef(false);

  // ── Carga el detalle del item: al montar y en cada tick de polling ──────────
  // Re-fetchear en cada tick mantiene cierreProgramado y estadoLote frescos desde
  // la BD compartida (Supabase). Es la única forma de sincronizar el countdown
  // entre dos backends locales distintos: el WebSocket no cruza máquinas.
  useEffect(() => {
    let cancel = false;
    getItemCatalogoDetalle(catalogoId, itemId, currentUser?.token)
      .then(d => { if (!cancel) { setDetail(d); setLoading(false); detailLoadedRef.current = true; } })
      .catch(err => {
        if (cancel) return;
        // Solo alertar/cortar el spinner en la carga inicial; ignorar errores transitorios del polling.
        if (!detailLoadedRef.current) { Alert.alert('No se pudo cargar el item', err.message); setLoading(false); }
      });
    return () => { cancel = true; };
  }, [catalogoId, itemId, currentUser?.token, bidTick]);

  // ── Fetch de pujas: se ejecuta al montar, al pujar (bidTick) y cada 5s ─────
  const estadoLoteActual = detail?.estadoLote ?? estadoLoteHint;
  const detailItemId = detail?.identificador;

  useEffect(() => {
    if (!detailItemId || !subastaId) return;
    const activo = estadoLoteActual === 'en_puja' || estadoLoteActual === 'subastado';
    if (!activo) return;
    let cancel = false;
    getHistorialPujas(subastaId, detailItemId, currentUser?.token)
      .then(h => { if (!cancel) setBids((h || []).map(mapBid).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))); })
      .catch(() => {});
    return () => { cancel = true; };
  }, [detailItemId, subastaId, currentUser?.token, bidTick, estadoLoteActual]);

  // ── Polling cada 5s para lotes en vivo ────────────────────────────────────
  useEffect(() => {
    if (estadoLoteActual !== 'en_puja' || !subastaId) return;
    const id = setInterval(() => setBidTick(t => t + 1), BIDS_POLL_MS);
    return () => clearInterval(id);
  }, [estadoLoteActual, subastaId]);

  // Callback para que el hijo dispare un refresh inmediato después de pujar.
  const refreshBids = useCallback(() => setBidTick(t => t + 1), []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#7C3AED" />
      </View>
    );
  }
  if (!detail) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-slate-500 font-bold">Item not found.</Text>
      </View>
    );
  }

  // Estado del LOTE (backend autoritativo): define la vista. La subasta va por lotes.
  const estadoLote = estadoLoteActual;
  const isLive = estadoLote === 'en_puja';
  const isEnded = estadoLote === 'subastado';

  const images = (detail.producto?.fotos || []).map(f => buildImageUrl(f.url)).filter(Boolean);
  const highest = bids.length ? Math.max(...bids.map(b => Number(b.importe))) : null;

  // Acceso a precios por rango (RF-13) + dueño (siempre ve lo suyo y no puede pujar).
  const isLoggedIn = !!currentUser;
  const isOwner = isLoggedIn && String(currentUser.id) === String(detail.producto?.duenioId);
  const requiredCategory = subastaInfo?.categoria;
  const categoryOk = isLoggedIn && hasEnoughCategory(currentUser.category, requiredCategory);
  // Ver precios: cualquier usuario registrado (incluye al dueño). La categoria solo limita el pujar.
  const showPrices = isLoggedIn;
  const bidEligible = isLoggedIn && categoryOk;
  const lockReason = isOwner ? null : !isLoggedIn ? 'sign-in' : !categoryOk ? 'category' : null;
  const requiredLabel = requiredCategory
    ? requiredCategory.charAt(0).toUpperCase() + requiredCategory.slice(1)
    : '—';

  const MASKED = '$ —,—';
  const item = {
    id: detail.identificador,
    precioBase: showPrices ? detail.precioBase : MASKED,
    comision: showPrices ? detail.comision : MASKED,
    subastado: isEnded ? 'si' : 'no',
    currentBid: showPrices ? highest : MASKED,
    importeAdjudicado: showPrices ? (isEnded ? highest : null) : MASKED,
    estadoLote,
    cierreProgramado: detail.cierreProgramado ?? null,
    producto: {
      descripcionCatalogo: detail.producto?.descripcionCatalogo,
      descripcionCompleta: detail.producto?.descripcionCompleta,
      artista: detail.producto?.artista,
      fechaObra: detail.producto?.fecha,
      resenia: detail.producto?.resenia,
      image: images[0],
      images,
    },
  };
  const parentCatalog = {
    descripcion: catalogDescripcion,
    image: catalogImage,
    subasta: subastaInfo,
  };
  const shared = {
    item, parentCatalog, navigation,
    canAccessPrices: showPrices, bidEligible, lockReason, requiredLabel,
    currentUser, isOwner, bids, won: !!won,
    subastaId, refreshBids, hasPendingMulta, hasVerifiedPayment,
  };

  if (isLive) return <ItemDetailLiveView {...shared} />;
  if (isEnded) return <ItemDetailEndedView {...shared} />;
  return <ItemDetailUpcomingView {...shared} />;
}

// ── Camino "producto" (MyAuctions / aceptar propuesta) ───────────────────────
// Resuelve el item de catálogo del producto y delega en CatalogItemDetail, de modo
// que el dueño ve EXACTAMENTE el mismo estado que cualquiera desde el catálogo.
function SellerItemDetail({ producto: productoParam, productoId, currentUser, navigation }) {
  const [producto, setProducto] = useState(productoParam || null);
  const [loading, setLoading] = useState(!productoParam);

  useEffect(() => {
    if (productoParam) return;
    let cancel = false;
    (async () => {
      try {
        const prod = await getProductoById(productoId, currentUser?.token);
        if (!cancel) setProducto(prod);
      } catch (error) {
        if (!cancel) Alert.alert('No se pudo cargar el artículo', error.message);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [productoId, currentUser?.token]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#7C3AED" />
      </View>
    );
  }

  const sub = producto?.subasta;
  // Producto aún sin item de catálogo asignado (no debería pasar para aceptado/en subasta).
  if (!sub?.catalogoId || !sub?.itemId) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-slate-500 font-bold text-center">
          Este artículo todavía no está asignado a una subasta.
        </Text>
      </View>
    );
  }

  return (
    <CatalogItemDetail
      catalogoId={sub.catalogoId}
      itemId={sub.itemId}
      subastaId={sub.identificador}
      subastaInfo={sub}
      catalogDescripcion={producto.descripcionCatalogo}
      catalogImage={buildImageUrl(producto.fotos?.[0]?.url)}
      currentUser={currentUser}
      navigation={navigation}
    />
  );
}

export default function ItemDetailScreen({ route, navigation }) {
  const { user: currentUser } = useContext(AuthContext);

  const realProductoId = route?.params?.productoId;
  const realProducto = route?.params?.producto;
  const realCatalogoId = route?.params?.catalogoId;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#f8fafc]"
    >
      <Header />

      {realCatalogoId ? (
        <CatalogItemDetail
          catalogoId={realCatalogoId}
          itemId={route?.params?.itemId}
          subastaId={route?.params?.subastaId}
          subastaInfo={route?.params?.subastaInfo}
          estadoLote={route?.params?.estadoLote}
          catalogDescripcion={route?.params?.catalogDescripcion}
          catalogImage={route?.params?.catalogImage}
          won={route?.params?.won}
          currentUser={currentUser}
          navigation={navigation}
        />
      ) : realProductoId ? (
        <SellerItemDetail
          producto={realProducto}
          productoId={realProductoId}
          currentUser={currentUser}
          navigation={navigation}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6 py-16">
          <Text className="text-slate-500 font-bold">Item not found.</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mt-4 px-4 py-2 rounded-xl bg-purple-100"
          >
            <Text className="text-[#7C3AED] font-bold">Go Back</Text>
          </TouchableOpacity>
        </View>
      )}

      <Footer />
    </KeyboardAvoidingView>
  );
}
