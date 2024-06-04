const { getAllTickets, add_Ticket } = require('../dao/mongo/tickets.dao')

const getTickets = async (req, res) => {
    const tickets = await getAllTickets()
    res.json(tickets)
}

const addTicket = async (newTicket) => {
    const ticket = await add_Ticket(newTicket)
    return ticket
}

module.exports = { addTicket, getTickets }