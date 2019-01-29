package com.FinalProject.EventPool.Models;

import java.util.function.Supplier;

/**
 * Created by Zohar on 29/01/2019.
 */
public class Edge<V>{
    private V source;
    private V target;
    private Integer weight;

    public Edge(V source, V target, Integer weight) {
        this.source = source;
        this.target = target;
        this.weight = weight;
    }

    public V getSource() {
        return source;
    }

    public V getTarget() {
        return target;
    }

    public Integer getWeight() {
        return weight;
    }

    public void setSource(V source) {
        this.source = source;
    }

    public void setTarget(V target) {
        this.target = target;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
    }
}
