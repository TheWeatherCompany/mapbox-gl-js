"use strict";

// var assign = require('lodash.assign');

/**
 * Add a layer group to the map.
 *
 * @param {Map} map
 * @param {string} groupId The id of the new group
 * @param {Array<Object>} layers The Mapbox style spec layers of the new group
 * @param {string} [beforeId] The layer id or group id after which the group
 *     will be inserted. If ommitted the group is added to the bottom of the
 *     style.
 */
function addGroup(map, groupId, layers, beforeId, preventUpdate) {
    var beforeLayerId = normalizeBeforeId(map, beforeId);
    for (var i = 0; i < layers.length; i++) {
        addLayerToGroup(map, groupId, layers[i], beforeLayerId, preventUpdate, true);
    }
}

/**
 * Add a single layer to an existing layer group.
 *
 * @param {Map} map
 * @param {string} groupId The id of group
 * @param {Object} layer The Mapbox style spec layer
 * @param {string} [beforeId] An existing layer id after which the new layer
 *     will be inserted. If ommitted the layer is added to the bottom of
 *     the group.
 */
function addLayerToGroup(map, groupId, layer, beforeId, preventUpdate) {
    var ignoreBeforeIdCheck = arguments[5];

    if (beforeId && !ignoreBeforeIdCheck && (!isLayer(map, beforeId) || getLayerGroup(map, beforeId) !== groupId)) {
        throw new Error('beforeId must be the id of a layer within the same group');
    } else if (!beforeId && !ignoreBeforeIdCheck) {
        beforeId = getLayerIdFromIndex(map, getGroupFirstLayerId(map, groupId) - 1);
    }

    var groupedLayer = Object.assign({}, layer, {metadata: Object.assign({}, layer.metadata || {}, {group: groupId})});
    map.addLayer(groupedLayer, beforeId, { preventUpdate: preventUpdate});
}

function moveLayerToGroup(map, groupId, layerId) {
    var layer = map.getLayer(layerId);
    if (layer) {
        if (!layer.metadata) { 
            layer.metadata = {};
        }
        layer.metadata.group = groupId;
    }
}
function removeLayerFromGroup(map, groupId, layerId) {
    var layer = map.getLayer(layerId);
    if (layer && layer.metadata && layer.metadata.group === groupId) {
        layer.metadata.group = undefined;
    }
}

function hasGroup(map, groupId) {
    return (getGroupFirstLayerIndex(map, groupId) >= 0);
}

/**
 * Remove a layer group and all of its layers from the map.
 *
 * @param {Map} map
 * @param {string} groupId The id of the group to be removed.
 */
function removeGroup(map, groupId) {
    var layers = map.getStyle().layers;
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        if (getLayerGroup(map, layer.id)) {
            if (layer.metadata.group === groupId) {
                map.removeLayer(layer.id);
            }
        }
    }
}

/**
 * Remove a layer group and all of its layers from the map.
 *
 * @param {Map} map
 * @param {string} groupId The id of the group to be removed.
 */
function moveGroup(map, groupId, beforeId) {
    var beforeLayerId = normalizeBeforeId(map, beforeId);

    var layers = map.getStyle().layers;
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        if (getLayerGroup(map, layer.id)) {
            if (layer.metadata.group === groupId) {
                map.moveLayer(layer.id, beforeLayerId);
            }
        }
    }
}

/**
 * Get the id of the first layer in a group.
 *
 * @param {Map} map
 * @param {string} groupId The id of the group.
 * @returns {string}
 */
function getGroupFirstLayerId(map, groupId) {
    return getLayerIdFromIndex(map, getGroupFirstLayerIndex(map, groupId));
}

/**
 * Get the id of the last layer in a group.
 *
 * @param {Map} map
 * @param {string} groupId The id of the group.
 * @returns {string}
 */
function getGroupLastLayerId(map, groupId) {
    return getLayerIdFromIndex(map, getGroupLastLayerIndex(map, groupId));
}

function getGroupFirstLayerIndex(map, groupId) {
    var layers = map.getStyle().layers;
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        if (layer.metadata && layer.metadata.group === groupId) {
            return i;
        }
    }
    return -1;
}

function getGroupLastLayerIndex(map, groupId) {
    var layers = map.getStyle().layers;
    var i = getGroupFirstLayerIndex(map, groupId);
    if (i === -1) return -1;
    while (i < layers.length && (layers[i].id === groupId || (layers[i].metadata && layers[i].metadata.group === groupId))) i++;
    return i - 1;
}

function getLayerIdFromIndex(map, index) {
    if (index === -1) return undefined;
    var layers = map.getStyle().layers;
    return layers[index] && layers[index].id;
}

function getLayerGroup(map, layerId) {
    var layer = map.getLayer(layerId);
    if (layer && layer.metadata && layer.metadata.group) return layer.metadata.group;
}

function isLayer(map, layerId) {
    return !!map.getLayer(layerId);
}

function normalizeBeforeId(map, beforeId) {
    if (beforeId && !isLayer(map, beforeId)) {
        return getGroupFirstLayerId(map, beforeId);
    } else if (beforeId && getLayerGroup(map, beforeId)) {
        return getGroupFirstLayerId(map, getLayerGroup(map, beforeId));
    } else {
        return beforeId;
    }
}

module.exports = {
    addGroup,
    removeGroup,
    moveGroup,
    addLayerToGroup,
    getGroupFirstLayer: getGroupFirstLayerId,
    getGroupLastLayer: getGroupLastLayerId,
    getGroupFirstLayerIndex,
    getGroupLastLayerIndex,
    getLayerGroup,
    hasGroup,
    removeLayerFromGroup,
    moveLayerToGroup
};