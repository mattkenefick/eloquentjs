'use strict';

import { expect } from 'chai';
import FilmModel from './models/FilmModel';
import FilmCollection from './collections/FilmCollection';
import {
    ActiveRecord,
    Collection,
    Model,
} from '../index';


// -----------------------------------------------------------------------------


const items: any = [
    { name: 'Ashley', x: 1 },
    { name: 'Briana', x: 2 },
    { name: 'Charlotte', x: 3 },
    { name: 'Danielle', x: 4 },
    { name: 'Elizabeth', x: 5 },
    { name: 'Fallon', x: 6 },
];

const options = {
    meta: {
        pagination: {
            total: 1938,
            count: 15,
            per_page: 15,
            current_page: 1,
            total_pages: 130,
        },
    },
};


// -----------------------------------------------------------------------------


/**
 * Remote Collection Tests
 */
describe('Remote Collection Tests', () => {

    it('should url', () => {
        const collection: FilmCollection = FilmCollection.hydrate(items, options);
        const model: FilmModel = collection.at(0);

        // Get attribute
        // model.save();
    });

});
