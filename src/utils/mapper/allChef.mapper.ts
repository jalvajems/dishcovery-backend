import { Document } from "mongoose";
import { IChef } from "../../types/chef.types";
import { chefMapper } from "./chef.mapper";

export function chefsMapper(chefs: (IChef & Document)[]): IChef[] {
    return chefs.map(chef => chefMapper(chef));
}