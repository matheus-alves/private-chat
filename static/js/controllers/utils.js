/**
 * Created by Matheus Alves on 14/05/2016.
 */

'use strict';

function buildUrl ($location, path) {
    return $location.protocol() + '://' + $location.host() + ':' + $location.port() + path;
}

function createHeaders ($cookieStore) {
    return {
        headers: {
            authorization: $cookieStore.get('token')
        }
    };
}