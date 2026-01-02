package com.jjrising.bingo.security;

import com.jjrising.bingo.security.db.AppUser;
import com.jjrising.bingo.security.dto.UserDto;
import com.jjrising.bingo.security.dto.UserRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    @GetMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDto> getUsers() {
        List<AppUser> users = userService.getAllAppUsers();
        return userMapper.toDto(users);
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto inviteUser(@RequestBody UserRequest userRequest) {
        AppUser user = userService.addUserForInvite(userRequest);
        return userMapper.toDto(user);
    }
}
