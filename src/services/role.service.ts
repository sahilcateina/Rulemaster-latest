import * as roleDAO from '../dao/role.dao';

export const getRoleById = async (id: string) => {
  return await roleDAO.getRoleById(id);
};
