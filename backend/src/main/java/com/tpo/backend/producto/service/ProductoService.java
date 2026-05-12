package com.tpo.backend.producto.service;

import com.tpo.backend.common.exception.ResourceNotFoundException;
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

    private final ProductoRepository productoRepository;
    private final FotoRepository fotoRepository;
    private final PersonaRepository personaRepository;
    private final SeguroRepository seguroRepository;

    public ProductoService(ProductoRepository productoRepository,
                           FotoRepository fotoRepository,
                           PersonaRepository personaRepository,
                           SeguroRepository seguroRepository) {
        this.productoRepository = productoRepository;
        this.fotoRepository = fotoRepository;
        this.personaRepository = personaRepository;
        this.seguroRepository = seguroRepository;
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
        if (request.getRevisor() != null) prod.setRevisor(request.getRevisor());
        if (request.getSeguro() != null) prod.setSeguro(request.getSeguro());
        if (request.getCategoria() != null) prod.setCategoria(request.getCategoria());
        if (request.getSubcategoria() != null) prod.setSubcategoria(request.getSubcategoria());
        productoRepository.save(prod);
        return toDto(prod);
    }

    @Transactional
    public ProductoDto crear(Long duenioId, ProductoNewRequest request) {
        ProductoEntity prod = new ProductoEntity();
        prod.setFecha(LocalDate.parse(request.getFecha()));
        prod.setDisponible(request.getDisponible());
        prod.setDescripcionCatalogo(request.getDescripcionCatalogo() != null ?
                request.getDescripcionCatalogo() : "No Posee");
        prod.setDescripcionCompleta(request.getDescripcionCompleta());
        prod.setRevisor(request.getRevisor());
        prod.setSeguro(request.getSeguro());
        prod.setCategoria(request.getCategoria());
        prod.setSubcategoria(request.getSubcategoria());
        prod.setDuenio(duenioId);
        prod = productoRepository.save(prod);
        return toDto(prod);
    }

    @Transactional
    public byte[] getFoto(Long productoId, Long fotoId) {
        FotoEntity foto = fotoRepository.findById(fotoId)
                .filter(f -> f.getProducto().equals(productoId))
                .orElseThrow(() -> new ResourceNotFoundException("Foto no encontrada: " + fotoId));
        return foto.getFoto();
    }

    private ProductoDto toDto(ProductoEntity prod) {
        PersonaEntity duenioPersona = personaRepository.findById(prod.getDuenio()).orElse(null);
        ProductoDto.DuenioDto duenioDto = new ProductoDto.DuenioDto(
                prod.getDuenio(),
                duenioPersona != null ? duenioPersona.getNombre() : "Duenio " + prod.getDuenio()
        );

        List<ProductoDto.FotoDto> fotos = fotoRepository.findByProducto(prod.getId()).stream()
                .map(f -> new ProductoDto.FotoDto(f.getId(),
                        "/api/v1/productos/" + prod.getId() + "/fotos/" + f.getId()))
                .toList();

        ProductoDto.SeguroDto seguroDto = null;
        if (prod.getSeguro() != null) {
            SeguroEntity seguro = seguroRepository.findById(prod.getSeguro()).orElse(null);
            if (seguro != null) {
                seguroDto = new ProductoDto.SeguroDto(seguro.getNroPoliza(),
                        seguro.getCompania(), seguro.getImporte());
            }
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
