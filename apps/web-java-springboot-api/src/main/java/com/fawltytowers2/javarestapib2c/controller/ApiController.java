// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

package com.fawltytowers2.javarestapib2c.controller;

import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.bind.annotation.PathVariable;

import java.net.MalformedURLException;
import javax.servlet.http.HttpServletResponse;

import com.fawltytowers2.javarestapib2c.model.Item;
import com.fawltytowers2.javarestapib2c.security.MsalAuthHelper;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
public class ApiController {

    @Autowired
    MsalAuthHelper msalAuthHelper;

    private List<Item> items = new ArrayList<Item>(Arrays.asList(
          new Item( "001002003", "First item")
        , new Item( "002003004", "Second item")
        , new Item( "003004005", "Third item")
    ));
    
    @RequestMapping("/echo")
    public String echo() {
        return "Hello from msal-obo-sample!";
    }

    @RequestMapping("/api/items")
    public List<Item> listItems() {
        return items;
    }

    @RequestMapping("/api/items/{id}")
    public Item getItem(@PathVariable String id, HttpServletResponse res) {
        Item item = null;
        for( int n = 0; n < items.size(); n++ ) {
            if ( items.get(n).getItemId().equals(id) ) {
                item = items.get(n);
                break;
            }
        }
        if ( item == null ){
            res.setStatus(HttpServletResponse.SC_NOT_FOUND);            
        }
        return item;
    }
}
