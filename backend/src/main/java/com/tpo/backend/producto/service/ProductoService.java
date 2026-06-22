package com.tpo.backend.producto.service;

import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.duenio.entity.DuenioEntity;
import com.tpo.backend.duenio.repository.DuenioRepository;
import com.tpo.backend.empleado.entity.EmpleadoEntity;
import com.tpo.backend.empleado.repository.EmpleadoRepository;
import com.tpo.backend.persona.PersonaEntity;
import com.tpo.backend.persona.PersonaRepository;
import com.tpo.backend.producto.dto.ProductoDto;
import com.tpo.backend.producto.dto.ProductoNewRequest;
import com.tpo.backend.producto.dto.ProductoUpdateRequest;
import com.tpo.backend.producto.entity.FotoEntity;
import com.tpo.backend.producto.entity.ProductoEntity;
import com.tpo.backend.producto.repository.FotoRepository;
import com.tpo.backend.producto.repository.ProductoRepository;
import com.tpo.backend.seguro.entity.SeguroEntity;
import com.tpo.backend.seguro.repository.SeguroRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ProductoService {

    /** Empleado del sistema que actua como verificador por defecto (ver AuthService). */
    private static final Long VERIFICADOR_SISTEMA_ID = 2L;

    private final ProductoRepository productoRepository;
    private final FotoRepository fotoRepository;
    private final PersonaRepository personaRepository;
    private final SeguroRepository seguroRepository;
    private final DuenioRepository duenioRepository;
    private final EmpleadoRepository empleadoRepository;

    public ProductoService(ProductoRepository productoRepository,
                           FotoRepository fotoRepository,
                           PersonaRepository personaRepository,
                           SeguroRepository seguroRepository,
                           DuenioRepository duenioRepository,
                           EmpleadoRepository empleadoRepository) {
        this.productoRepository = productoRepository;
        this.fotoRepository = fotoRepository;
        this.personaRepository = personaRepository;
        this.seguroRepository = seguroRepository;
        this.duenioRepository = duenioRepository;
        this.empleadoRepository = empleadoRepository;
    }

    private EmpleadoEntity findEmpleado(Long id) {
        return empleadoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado no encontrado: " + id));
    }

    private SeguroEntity findSeguro(String nroPoliza) {
        return seguroRepository.findById(nroPoliza)
                .orElseThrow(() -> new ResourceNotFoundException("Seguro no encontrado: " + nroPoliza));
    }

    @Transactional
    public List<ProductoDto> listar(Boolean disponible, int page, int size) {
        var pageable = PageRequest.of(page, size);
        if (disponible == null) {
            return productoRepository.findAll(pageable).stream().map(this::toDto).toList();
        }
        return productoRepository.findByDisponible(disponible, pageable).stream().map(this::toDto).toList();
    }

    @Transactional
    public ProductoDto getById(Long id) {
        ProductoEntity prod = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + id));
        return toDto(prod);
    }

    @Transactional
    public ProductoDto actualizar(Long id, ProductoUpdateRequest request) {
        ProductoEntity prod = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + id));
        if (request.getFecha() != null) prod.setFecha(LocalDate.parse(request.getFecha()));
        if (request.getDisponible() != null) prod.setDisponible(request.getDisponible());
        if (request.getDescripcionCatalogo() != null) prod.setDescripcionCatalogo(request.getDescripcionCatalogo());
        if (request.getDescripcionCompleta() != null) prod.setDescripcionCompleta(request.getDescripcionCompleta());
        if (request.getRevisor() != null) prod.setRevisor(findEmpleado(request.getRevisor()));
        if (request.getSeguro() != null) prod.setSeguro(findSeguro(request.getSeguro()));
        if (request.getCategoria() != null) prod.setCategoria(request.getCategoria());
        if (request.getSubcategoria() != null) prod.setSubcategoria(request.getSubcategoria());
        if (request.getArtista() != null) prod.setArtista(request.getArtista());
        if (request.getResenia() != null) prod.setResenia(request.getResenia());
        productoRepository.save(prod);
        return toDto(prod);
    }

    @Transactional
    public ProductoDto crear(Long duenioId, ProductoNewRequest request) {
        DuenioEntity duenio = ensureDuenio(duenioId);
        ProductoEntity prod = new ProductoEntity();
        prod.setFecha(LocalDate.parse(request.getFecha()));
        prod.setDisponible(request.getDisponible());
        prod.setDescripcionCatalogo(request.getDescripcionCatalogo() != null ?
                request.getDescripcionCatalogo() : "No Posee");
        prod.setDescripcionCompleta(request.getDescripcionCompleta());
        prod.setRevisor(findEmpleado(request.getRevisor()));
        if (request.getSeguro() != null) prod.setSeguro(findSeguro(request.getSeguro()));
        prod.setCategoria(request.getCategoria());
        prod.setSubcategoria(request.getSubcategoria());
        prod.setArtista(request.getArtista());
        prod.setResenia(request.getResenia());
        prod.setDuenio(duenio);
        prod = productoRepository.save(prod);
        return toDto(prod);
    }

    /**
     * Garantiza que la persona tenga rol DUENIO. {@code productos.duenio} referencia a
     * {@code duenios}, y el registro solo crea {@code clientes}; al enviar su primer bien
     * (RF-45) la persona adquiere el rol de dueño de forma diferida.
     */
    private DuenioEntity ensureDuenio(Long personaId) {
        return duenioRepository.findById(personaId).orElseGet(() -> {
            DuenioEntity duenio = new DuenioEntity();
            PersonaEntity persona = personaRepository.findById(personaId)
                    .orElseThrow(() -> new ResourceNotFoundException("Persona no encontrada: " + personaId));
            duenio.setPersona(persona);
            duenio.setVerificador(findEmpleado(VERIFICADOR_SISTEMA_ID));
            if (persona.getPaisOrigen() != null) {
                duenio.setNumeroPais(persona.getPaisOrigen().getNumero());
            }
            return duenioRepository.save(duenio);
        });
    }

    @Transactional
    public byte[] getFoto(Long productoId, Long fotoId) {
        FotoEntity foto = fotoRepository.findById(fotoId)
                .filter(f -> f.getProducto().getId().equals(productoId))
                .orElseThrow(() -> new ResourceNotFoundException("Foto no encontrada: " + fotoId));
        return foto.getFoto();
    }

    private ProductoDto toDto(ProductoEntity prod) {
        PersonaEntity duenioPersona = prod.getDuenio().getPersona();
        ProductoDto.DuenioDto duenioDto = new ProductoDto.DuenioDto(
                prod.getDuenio().getId(),
                duenioPersona != null ? duenioPersona.getNombre() : "Duenio " + prod.getDuenio().getId()
        );

        List<ProductoDto.FotoDto> fotos = fotoRepository.findByProductoId(prod.getId()).stream()
                .map(f -> new ProductoDto.FotoDto(f.getId(),
                        "/api/v1/productos/" + prod.getId() + "/fotos/" + f.getId()))
                .toList();

        ProductoDto.SeguroDto seguroDto = null;
        if (prod.getSeguro() != null) {
            SeguroEntity seguro = prod.getSeguro();
            seguroDto = new ProductoDto.SeguroDto(seguro.getNroPoliza(),
                    seguro.getCompania(), seguro.getImporte());
        }

        return new ProductoDto(
                prod.getId(),
                prod.getDescripcionCatalogo(),
                prod.getDescripcionCompleta(),
                prod.getFecha() != null ? prod.getFecha().toString() : null,
                Boolean.TRUE.equals(prod.getDisponible()) ? "si" : "no",
                duenioDto,
                fotos,
                seguroDto
        );
    }
}
