const event = require('./event');
const admin = require('./admin');
const news = require('./news')
const video = require('./video')
const topic = require('./topic')
const course = require('./course')
const document = require('./document')
const image = require('./image')
const review = require('./review')
const answer = require('./answer')
const dashboard = require('./dashboard')

module.exports = {
  event,
  admin,
  news,
  topic,
  video,
  course,
  document,
  image,
  review,
  answer,
  dashboard
}