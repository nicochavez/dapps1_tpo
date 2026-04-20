package com.tpo.backend.persona;

public class PersonaDTO {

    private Long id;
    private String documento;
    private String nombre;
    private String direccion;
    private String estado;
    private String fotoBase64; // Image handled as Base64 string for JSON
    private final String ESTADO_INICIAL = "activo"; // Default state for new personas
    // Constructors
    public PersonaDTO() {}

    public PersonaDTO(Long id, String documento, String nombre, String direccion, String fotoBase64) {
        this.id = id;
        this.documento = documento;
        this.nombre = nombre;
        this.direccion = direccion;
        this.estado = ESTADO_INICIAL;
        this.fotoBase64 = fotoBase64;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getFotoBase64() { return fotoBase64; }
    public void setFotoBase64(String fotoBase64) { this.fotoBase64 = fotoBase64; }
}