import * as groupDAO from '../dao/group.dao';

export const getGroupById = async (id: string) => {
    return await groupDAO.getGroupById(id);
  };