package com.tpo.backend.common.mock;

import com.tpo.backend.bien.dto.BienDetailDto;
import com.tpo.backend.bien.dto.BienListDto;
import com.tpo.backend.catalogo.dto.CatalogoListDto;
import com.tpo.backend.catalogo.dto.ItemCatalogoDetailDto;
import com.tpo.backend.cliente.dto.ClienteDto;
import com.tpo.backend.common.dto.PaisDto;
import com.tpo.backend.compra.dto.CompraDto;
import com.tpo.backend.cuentacobro.dto.CuentaCobroDto;
import com.tpo.backend.historial.dto.HistorialSubastaDto;
import com.tpo.backend.mediospago.dto.MedioPagoDto;
import com.tpo.backend.multa.dto.MultaDto;
import com.tpo.backend.producto.dto.ProductoDto;
import com.tpo.backend.puja.dto.MiPujaDto;
import com.tpo.backend.puja.dto.PujaHistorialDto;
import com.tpo.backend.seguro.dto.SeguroDto;
import com.tpo.backend.subasta.dto.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

/**
 * In-memory mock data store. Replaces a real database for development/demo purposes.
 */
@Component
public class MockDataStore {

    // -------- ID counters --------
    private final AtomicLong medioPagoIdSeq = new AtomicLong(10);
    private final AtomicLong pujaIdSeq = new AtomicLong(100);
    private final AtomicLong bienIdSeq = new AtomicLong(10);
    private final AtomicLong cuentaCobroIdSeq = new AtomicLong(10);

    // -------- Paises --------
    public final List<PaisDto> paises = List.of(
            new PaisDto(1, "Argentina", "AR", "Argentina"),
            new PaisDto(2, "Uruguay", "UY", "Uruguayo"),
            new PaisDto(3, "Brasil", "BR", "Brasilero"),
            new PaisDto(4, "Chile", "CL", "Chileno"),
            new PaisDto(5, "Estados Unidos", "US", "Estadounidense")
    );

    // -------- Authenticated user (mock — single user session) --------
    // documento -> password (plain text for demo)
    public final Map<String, String> credentials = new HashMap<>(Map.of(
            "12345678", "password123"
    ));
    // documento -> registered (completed second stage)
    public final Map<String, Boolean> registered = new HashMap<>(Map.of(
            "12345678", true
    ));

    // Fixed authenticated client
    public ClienteDto getAuthenticatedCliente() {
        return new ClienteDto(
                1L,
                "12345678",
                "Juan Postor",
                "Av. Corrientes 1234, CABA",
                "activo",
                "oro",
                "si",
                new PaisDto(1, "Argentina", "AR", "Argentina")
        );
    }

    // -------- Medios de pago --------
    public final List<MedioPagoDto> mediosPago = new ArrayList<>(List.of(
            new MedioPagoDto(1L, "cuenta_bancaria", "Banco Nacion - ****1234", "ARS", true, new BigDecimal("500000.00")),
            new MedioPagoDto(2L, "tarjeta_credito", "Visa ****5678", "USD", true, new BigDecimal("10000.00"))
    ));

    public long nextMedioPagoId() {
        return medioPagoIdSeq.incrementAndGet();
    }

    // -------- Subastadores --------
    public final SubastadorDto subastador1 = new SubastadorDto(1L, "Juan Perez", "MAT-001");
    public final SubastadorDto subastador2 = new SubastadorDto(2L, "Maria Garcia", "MAT-002");

    // -------- Items / Catalogos --------
    public final List<ItemCatalogoDto> itemsCatalogo1 = new ArrayList<>(List.of(
            new ItemCatalogoDto(1L, 1, "Juego de Te de 18 piezas", new BigDecimal("10000.00"), new BigDecimal("500.00"), "no",
                    List.of(new FotoRefDto(1L, "/api/v1/productos/1/fotos/1"))),
            new ItemCatalogoDto(2L, 2, "Reloj de pared antiguo", new BigDecimal("25000.00"), new BigDecimal("1250.00"), "no",
                    List.of(new FotoRefDto(2L, "/api/v1/productos/2/fotos/1")))
    ));

    public final List<ItemCatalogoDto> itemsCatalogo2 = new ArrayList<>(List.of(
            new ItemCatalogoDto(3L, 1, "Cuadro oleo firmado", new BigDecimal("80000.00"), new BigDecimal("4000.00"), "si",
                    List.of(new FotoRefDto(3L, "/api/v1/productos/3/fotos/1")))
    ));

    public final CatalogoDto catalogo1 = new CatalogoDto(1L, "Catalogo General Mayo 2026", itemsCatalogo1);
    public final CatalogoDto catalogo2 = new CatalogoDto(2L, "Catalogo Arte Junio 2026", itemsCatalogo2);

    // -------- Subastas --------
    public final List<SubastaListItemDto> subastas = List.of(
            new SubastaListItemDto(1L, "2026-05-01", "14:00", "abierta", "Buenos Aires", "comun", "ARS", subastador1),
            new SubastaListItemDto(2L, "2026-06-15", "16:00", "abierta", "Rosario", "oro", "USD", subastador2),
            new SubastaListItemDto(3L, "2026-03-10", "10:00", "cerrada", "Cordoba", "especial", "ARS", subastador1)
    );

    public final Map<Long, CatalogoDto> subastaCatalogo = Map.of(
            1L, catalogo1,
            2L, catalogo2
    );

    // Users connected to each subasta: subastaId -> set of clienteIds
    public final Map<Long, Set<Long>> conectados = new HashMap<>(Map.of(
            1L, new HashSet<>(),
            2L, new HashSet<>(),
            3L, new HashSet<>()
    ));

    // Current item per subasta
    public final Map<Long, Long> currentItem = new HashMap<>(Map.of(
            1L, 1L,
            2L, 3L
    ));

    // Best bid per item: itemId -> {importe, numeroPostor}
    public final Map<Long, Object[]> bestBid = new HashMap<>(Map.of(
            1L, new Object[]{new BigDecimal("15000.00"), 42},
            2L, new Object[]{new BigDecimal("26000.00"), 7},
            3L, new Object[]{new BigDecimal("85000.00"), 3}
    ));

    // -------- Pujas --------
    // itemId -> list of puja historial
    public final Map<Long, List<PujaHistorialDto>> pujasByItem = new HashMap<>(Map.of(
            1L, new ArrayList<>(List.of(
                    new PujaHistorialDto(1L, 42, new BigDecimal("15000.00"), "no", "2026-05-01T14:30:00"),
                    new PujaHistorialDto(2L, 7, new BigDecimal("13000.00"), "no", "2026-05-01T14:28:00")
            )),
            2L, new ArrayList<>(),
            3L, new ArrayList<>(List.of(
                    new PujaHistorialDto(3L, 3, new BigDecimal("85000.00"), "si", "2026-03-10T11:00:00")
            ))
    ));

    // clienteId -> list of mis pujas (subastaId -> list)
    public final Map<Long, List<MiPujaDto>> misPujas = new HashMap<>(Map.of(
            1L, new ArrayList<>(List.of(
                    new MiPujaDto(new MiPujaDto.ItemRefDto(1L, "Juego de Te de 18 piezas"), new BigDecimal("15000.00"), "no"),
                    new MiPujaDto(new MiPujaDto.ItemRefDto(3L, "Cuadro oleo firmado"), new BigDecimal("85000.00"), "si")
            ))
    ));

    public long nextPujaId() {
        return pujaIdSeq.incrementAndGet();
    }

    // -------- Compras --------
    public final List<CompraDto> compras = new ArrayList<>(List.of(
            new CompraDto(
                    1L,
                    new CompraDto.SubastaRefDto(3L, "2026-03-10"),
                    new CompraDto.ProductoRefDto(3L, "Cuadro oleo firmado"),
                    new BigDecimal("85000.00"),
                    new BigDecimal("4250.00"),
                    new BigDecimal("3000.00"),
                    new BigDecimal("92250.00"),
                    false
            )
    ));

    // -------- Productos --------
    public final List<ProductoDto> productos = List.of(
            new ProductoDto(
                    1L, "Juego de Te de 18 piezas", "Juego de Te de porcelana china, siglo XVIII. Excelente estado.",
                    "2026-04-01", "si",
                    new ProductoDto.DuenioDto(2L, "Maria Lopez"),
                    List.of(new ProductoDto.FotoDto(1L, "/api/v1/productos/1/fotos/1"),
                            new ProductoDto.FotoDto(2L, "/api/v1/productos/1/fotos/2")),
                    new ProductoDto.SeguroDto("POL-001", "La Caja Seguros", new BigDecimal("15000.00"))
            ),
            new ProductoDto(
                    2L, "Reloj de pared antiguo", "Reloj de pared estilo victoriando, circa 1890.",
                    "2026-04-01", "si",
                    new ProductoDto.DuenioDto(3L, "Carlos Ruiz"),
                    List.of(new ProductoDto.FotoDto(3L, "/api/v1/productos/2/fotos/1")),
                    new ProductoDto.SeguroDto("POL-002", "La Caja Seguros", new BigDecimal("30000.00"))
            ),
            new ProductoDto(
                    3L, "Cuadro oleo firmado", "Oleo sobre tela firmado por artista argentino, datado 1950.",
                    "2026-02-15", "no",
                    new ProductoDto.DuenioDto(1L, "Juan Postor"),
                    List.of(new ProductoDto.FotoDto(4L, "/api/v1/productos/3/fotos/1")),
                    new ProductoDto.SeguroDto("POL-003", "Zurich Seguros", new BigDecimal("100000.00"))
            )
    );

    // -------- Bienes propios --------
    public final List<BienListDto> bienes = new ArrayList<>(List.of(
            new BienListDto(1L, "Cuadro oleo sobre tela", "aceptado",
                    new BienListDto.SubastaRefDto(2L, "2026-06-15"),
                    new BigDecimal("50000.00"), new BigDecimal("2500.00"))
    ));

    public final List<BienDetailDto> bienesDetail = new ArrayList<>(List.of(
            new BienDetailDto(
                    1L, "Cuadro oleo sobre tela", "aceptado",
                    "Deposito Central - Buenos Aires",
                    new BienDetailDto.SeguroDto("POL-005", "La Caja Seguros", new BigDecimal("50000.00"), "no"),
                    new BienDetailDto.SubastaRefDto(2L, "2026-06-15", "16:00", "Salon Principal"),
                    new BigDecimal("50000.00"), new BigDecimal("2500.00"), null
            )
    ));

    public long nextBienId() {
        return bienIdSeq.incrementAndGet();
    }

    // -------- Multas --------
    public final List<MultaDto> multas = new ArrayList<>(List.of(
            new MultaDto(
                    1L,
                    new BigDecimal("15000.00"),
                    new BigDecimal("1500.00"),
                    "pendiente",
                    "2026-05-04T14:30:00",
                    new MultaDto.CompraRefDto(1L, "Juego de Te de 18 piezas")
            )
    ));

    // -------- Seguros de bienes --------
    public final Map<Long, SeguroDto> segurosBienes = Map.of(
            1L, new SeguroDto(
                    "POL-005", "La Caja Seguros", "no",
                    new BigDecimal("50000.00"),
                    new SeguroDto.ContactoDto("+54 11 4555-0000", "contacto@lacaja.com.ar")
            )
    );

    // -------- Cuentas de cobro --------
    public final List<CuentaCobroDto> cuentasCobro = new ArrayList<>(List.of(
            new CuentaCobroDto(1L, "Banco Nacion", "****5678", "ARS", "Argentina")
    ));

    public long nextCuentaCobroId() {
        return cuentaCobroIdSeq.incrementAndGet();
    }

    // -------- Historial subastas --------
    public final List<HistorialSubastaDto> historialSubastas = List.of(
            new HistorialSubastaDto(3L, "2026-03-10", "especial", "cerrada", 1, new BigDecimal("85000.00")),
            new HistorialSubastaDto(1L, "2026-05-01", "comun", "abierta", 0, new BigDecimal("15000.00"))
    );

    // -------- Catalogo list representation --------
    public List<CatalogoListDto> getCatalogosForSubasta(Long subastaId) {
        CatalogoDto cat = subastaCatalogo.get(subastaId);
        if (cat == null) return List.of();
        List<CatalogoListDto.ItemDto> items = cat.getItems().stream()
                .map(i -> new CatalogoListDto.ItemDto(
                        i.getIdentificador(),
                        i.getDescripcion(),
                        i.getPrecioBase(),
                        i.getSubastado(),
                        i.getImagenes().isEmpty() ? null : i.getImagenes().get(0).getUrl()
                )).toList();
        return List.of(new CatalogoListDto(cat.getIdentificador(), cat.getDescripcion(), items.size(), items));
    }

    // -------- Item catalogo detail lookup --------
    public Optional<ItemCatalogoDetailDto> getItemCatalogoDetail(Long catalogoId, Long itemId) {
        CatalogoDto cat = subastaCatalogo.values().stream()
                .filter(c -> c.getIdentificador().equals(catalogoId))
                .findFirst().orElse(null);
        if (cat == null) return Optional.empty();
        return cat.getItems().stream()
                .filter(i -> i.getIdentificador().equals(itemId))
                .map(i -> {
                    var prod = productos.stream()
                            .filter(p -> p.getIdentificador().equals(itemId))
                            .findFirst().orElse(null);
                    List<ItemCatalogoDetailDto.FotoDto> fotos = i.getImagenes().stream()
                            .map(f -> new ItemCatalogoDetailDto.FotoDto(f.getIdentificador(), f.getUrl()))
                            .toList();
                    String descCatalogo = prod != null ? prod.getDescripcionCatalogo() : i.getDescripcion();
                    String descCompleta = prod != null ? prod.getDescripcionCompleta() : i.getDescripcion();
                    return new ItemCatalogoDetailDto(
                            i.getIdentificador(),
                            i.getPrecioBase(),
                            i.getComision(),
                            i.getSubastado(),
                            new ItemCatalogoDetailDto.ProductoRefDto(itemId, descCatalogo, descCompleta, fotos)
                    );
                })
                .findFirst();
    }
}
