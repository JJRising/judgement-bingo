package com.jjrising.bingo;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaForwardingController {

    @RequestMapping(value = {
            "/",
            "/games/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
