/*
 * Copyright (c) 2016. Seedlabs LLC All Rights Reserved.
 */

/**
 * Created by mp2526 on 4/16/16.
 */
'use strict';

export default function(fields) {
    if(fields == null)
        return null;

    let result = [];
    let start = 0;
    let inBraces = 0;

    for (let current = 0; current < fields.length; current++) {
        if (fields.charAt(current) == '{') {
            inBraces++;
        } else if (fields.charAt(current) == '}') {
            inBraces--;
        }

        let atLastChar = (current == fields.length - 1);
        if(atLastChar) result.push(fields.substring(start));
        else if (fields.charAt(current) == ',' && !(inBraces > 0)) {
            result.push(fields.substring(start, current));
            start = current + 1;
        }
    }

    return result;
}
