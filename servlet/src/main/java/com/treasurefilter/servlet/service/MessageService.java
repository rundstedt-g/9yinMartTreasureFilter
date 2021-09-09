package com.treasurefilter.servlet.service;

import com.treasurefilter.servlet.entity.Message;
import com.treasurefilter.servlet.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MessageService {
    @Autowired
    private MessageRepository messageRepository;

    public List<Message> findAll(){
        return messageRepository.findAll(Sort.by(Sort.Direction.DESC,"createTime"));
    }

    @Transactional
    public Message addMessage(String content){
        Message message = new Message();
        message.setContent(content);
        message.setCreateTime(System.currentTimeMillis());
        return messageRepository.save(message);
    }
}