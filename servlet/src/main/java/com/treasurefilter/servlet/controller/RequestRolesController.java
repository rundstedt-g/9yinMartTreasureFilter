package com.treasurefilter.servlet.controller;

import com.treasurefilter.servlet.entity.Role;
import com.treasurefilter.servlet.entity.RoleContent;
import com.treasurefilter.servlet.entity.UseCardRec;
import com.treasurefilter.servlet.resultEntity.ServerResult;
import com.treasurefilter.servlet.service.RequestRolesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins =  {"http://localhost:8000", "http://localhost:8001","http://localhost:8002", "http://47.116.134.96:3002", "http://roles.rundstedt.cn"})
public class RequestRolesController {
    @Autowired
    private RequestRolesService service;

    @GetMapping(value="/requestByName")
    @ResponseStatus(HttpStatus.OK)
    public List<Role> findRolesByName(@RequestParam(value = "name") String name,
                                      @RequestParam(value = "serverId") String serverId){
        return service.findRolesByName(name,serverId);
    }

    @GetMapping(value="/getRoleContent")
    @ResponseStatus(HttpStatus.OK)
    public RoleContent getRoleContent(@RequestParam(value = "serverId") String serverId,
                                      @RequestParam(value = "roleUid") String roleUid ){
         return service.getRoleContent(serverId,roleUid);
    }

    @GetMapping(value="/serverList")
    @ResponseStatus(HttpStatus.OK)
    public List<ServerResult> findServerList(){
        return service.findServerList();
    }
}
