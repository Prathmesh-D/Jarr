package com.jarr.category;

import com.jarr.category.dto.CategoryDto;
import com.jarr.category.dto.CategoryRequest;
import com.jarr.user.User;
import com.jarr.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<CategoryDto> getVisibleCategories(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return categoryRepository.findVisibleByUserId(user.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryDto createCategory(String email, CategoryRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        String categoryName = request.getName().trim();

        // 1. Check if it matches a default category
        categoryRepository.findFirstByNameAndIsDefaultTrue(categoryName)
                .ifPresent(defaultCat -> {
                    throw new RuntimeException("Category with this name already exists");
                });

        // 2. Check user's custom categories (archived or not)
        java.util.Optional<Category> existingOpt = categoryRepository.findByUserIdAndName(user.getId(), categoryName);
        
        if (existingOpt.isPresent()) {
            Category existing = existingOpt.get();
            if (!existing.isArchived()) {
                throw new RuntimeException("Category with this name already exists");
            }
            // Restore archived category
            existing.setArchived(false);
            existing.setType(request.getType());
            existing.setIconKey(request.getIconKey());
            existing.setColorHex(request.getColorHex());
            return mapToDto(categoryRepository.save(existing));
        }

        Category category = Category.builder()
                .user(user)
                .name(categoryName)
                .iconKey(request.getIconKey())
                .colorHex(request.getColorHex())
                .type(request.getType())
                .isDefault(false)
                .isArchived(false)
                .build();

        Category saved = categoryRepository.save(category);
        return mapToDto(saved);
    }

    @Transactional
    public CategoryDto updateCategory(String email, Long categoryId, CategoryRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!user.getId().equals(category.getUser().getId())) {
            throw new RuntimeException("Cannot edit this category");
        }
        
        if (category.isDefault()) {
            throw new RuntimeException("Cannot edit default categories");
        }

        // Check name clash if name changed
        if (!category.getName().equals(request.getName()) && 
            categoryRepository.existsByUserIdAndNameAndIsArchivedFalse(user.getId(), request.getName())) {
            throw new RuntimeException("Category with this name already exists");
        }

        category.setName(request.getName());
        category.setIconKey(request.getIconKey());
        category.setColorHex(request.getColorHex());
        category.setType(request.getType());

        return mapToDto(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(String email, Long categoryId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!user.getId().equals(category.getUser().getId())) {
            throw new RuntimeException("Cannot delete this category");
        }

        if (category.isDefault()) {
            throw new RuntimeException("Cannot delete default categories");
        }

        // Soft delete (archive)
        category.setArchived(true);
        categoryRepository.save(category);
    }

    private CategoryDto mapToDto(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .iconKey(category.getIconKey())
                .colorHex(category.getColorHex())
                .type(category.getType())
                .isDefault(category.isDefault())
                .build();
    }
}
