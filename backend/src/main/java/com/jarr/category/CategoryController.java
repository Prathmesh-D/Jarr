package com.jarr.category;

import com.jarr.category.dto.CategoryDto;
import com.jarr.category.dto.CategoryRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getCategories(Authentication authentication) {
        return ResponseEntity.ok(categoryService.getVisibleCategories(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(
            Authentication authentication,
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryService.createCategory(authentication.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> updateCategory(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.updateCategory(authentication.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            Authentication authentication,
            @PathVariable Long id) {
        categoryService.deleteCategory(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
