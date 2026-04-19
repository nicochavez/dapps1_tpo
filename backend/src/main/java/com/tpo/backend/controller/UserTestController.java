package com.tpo.backend.controller;

import com.tpo.backend.model.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/test")
public class UserTestController {

    @GetMapping("/users")
    public List<User> listUsers() {
        return Arrays.asList(
                new User(1L, "Alice Example", "alice@example.com"),
                new User(2L, "Bob Example", "bob@example.com"),
                new User(3L, "Carol Example", "carol@example.com")
        );
    }
}
