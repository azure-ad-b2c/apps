package com.fawltytowers2.javarestapib2c.model;

/**
 * This is simple Item model class
 */
public class Item {
    private String itemId;
    private String itemName;

    public Item(String itemId, String itemName) {
        this.setItemId(itemId);
        this.setItemName(itemName);
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public String getItemId() {
        return itemId;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getItemName() {
        return itemName;
    }
}

