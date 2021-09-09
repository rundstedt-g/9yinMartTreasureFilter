package com.treasurefilter.servlet.controller;

import com.treasurefilter.servlet.entity.Message;
import com.treasurefilter.servlet.entity.Role;
import com.treasurefilter.servlet.entity.RoleContent;
import com.treasurefilter.servlet.resultEntity.ServerResult;
import com.treasurefilter.servlet.service.MessageService;
import com.treasurefilter.servlet.service.RequestRolesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins =  {"http://localhost:8000", "http://localhost:8001","http://localhost:8002", "http://47.116.134.96:3002", "http://roles.rundstedt.cn"})
public class RequestRolesController {
    @Autowired
    private RequestRolesService service;
    @Autowired
    private MessageService messageService;

    @GetMapping(value="/requestByName")
    @ResponseStatus(HttpStatus.OK)
    public List<Role> findRolesByName(@RequestParam(value = "name") String name,
                                      @RequestParam(value = "serverId") String serverId){
        return service.findRolesByName(name,serverId);
    }

    @GetMapping(value="/requestById")
    @ResponseStatus(HttpStatus.OK)
    public List<Role> findRolesById(@RequestParam(value = "id") String id,
                                      @RequestParam(value = "serverId") String serverId){
        return service.findRolesById(id, serverId);
    }

    @GetMapping(value="/getRoleContent")
    @ResponseStatus(HttpStatus.OK)
    public RoleContent getRoleContent(@RequestParam(value = "serverId") String serverId,
                                      @RequestParam(value = "itemId") String itemId ){
         return service.getRoleContent(serverId,itemId);
    }

    @GetMapping(value="/serverList")
    @ResponseStatus(HttpStatus.OK)
    public List<ServerResult> findServerList(){
        return service.findServerList();
    }

    @GetMapping(value="/message")
    @ResponseStatus(HttpStatus.OK)
    public List<Message> findMessageList(){
        return messageService.findAll();
    }

    @PostMapping(value="/message")
    @ResponseStatus(HttpStatus.OK)
    public Message addMessage(@RequestParam("content") String content){
        return messageService.addMessage(content);
    }
}
