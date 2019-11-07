const PledgesService = {
  getAllPledges(knex) {
    return knex.select('*').from('terra_pledges')
  },
  insertFolder(knex, newPledge) {
    return knex
      .insert(newPledge)
      .into('terra_pledges')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  getById(knex, id) {
    return knex
      .from('terra_pledges')
      .select('*')
      .where('id', id)
      .first()
  },
  updatePledge(knex, id, newPledge) {
    return knex
      .from('terra_pledges')
      .where({ id })
      .update(newPledge)
  }
}

module.exports = PledgesService
