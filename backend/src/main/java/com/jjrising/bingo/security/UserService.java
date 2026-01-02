package com.jjrising.bingo.security;

import com.jjrising.bingo.security.db.AppUser;
import com.jjrising.bingo.security.db.AppUserRepository;
import com.jjrising.bingo.security.dto.UserRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final AppUserRepository appUserRepository;

    public List<AppUser> getAllAppUsers() {
        return appUserRepository.findAll();
    }

    public AppUser addUserForInvite(UserRequest userRequest) {
        AppUser user = AppUser.builder().inviteName(userRequest.inviteName()).email(userRequest.email()).build();
        return appUserRepository.save(user);
    }
}
