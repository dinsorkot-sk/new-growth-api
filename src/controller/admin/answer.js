const { Op } = require('sequelize');
const { sequelize, Topic, TopicAnswer } = require('../../models');

const generatePaginationLinks = (req, offset, limit, totalCount, search = '') => {
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(totalCount / limit);

    return {
        totalCount,
        currentPage,
        totalPages,
        prev: currentPage > 1
            ? `${baseUrl}?offset=${offset - limit}&limit=${limit}&search=${encodeURIComponent(search)}`
            : null,
        next: currentPage < totalPages
            ? `${baseUrl}?offset=${offset + limit}&limit=${limit}&search=${encodeURIComponent(search)}`
            : null
    };
};


// ---------- Answer Controllers ---------- //
exports.createAnswer = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { answer_text, answered_by, status = 'hide', topic_id } = req.body;

        if (!topic_id) {
            await t.rollback();
            return res.status(400).json({ message: 'topic_id is required' });
        }

        const topic = await Topic.findByPk(topic_id, { transaction: t });
        if (!topic) {
            await t.rollback();
            return res.status(404).json({ message: 'Topic not found' });
        }

        const answer = await TopicAnswer.create({
            topic_id,
            answer_text,
            answered_by,
            status,
            created_at: new Date(),
            updated_at: new Date()
        }, { transaction: t });

        await t.commit();
        res.status(201).json({ message: 'Answer created', data: answer });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ message: 'Error creating answer', error: err.message });
    }
};

exports.getAnswers = async (req, res) => {
    try {
        const { offset = 0, limit = 10, topicId } = req.query;
        const parsedOffset = parseInt(offset);
        const parsedLimit = parseInt(limit);

        const where = {};
        if (topicId) where.topic_id = topicId;

        const totalCount = await TopicAnswer.count({ where });

        const answers = await TopicAnswer.findAll({
            where,
            offset: parsedOffset,
            limit: parsedLimit,
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            data: answers,
            pagination: generatePaginationLinks(req, parsedOffset, parsedLimit, totalCount, '')
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching answers', error: err.message });
    }
};

exports.getAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const answer = await TopicAnswer.findByPk(id);
        if (!answer) return res.status(404).json({ message: 'Answer not found' });
        res.json(answer);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching answer', error: err.message });
    }
};

exports.updateAnswer = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { answer_text, answered_by, status } = req.body;

        const answer = await TopicAnswer.findByPk(id, { transaction: t });
        if (!answer) {
            await t.rollback();
            return res.status(404).json({ message: 'Answer not found' });
        }

        if (req.body.topic_id) {
            await t.rollback();
            return res.status(400).json({ message: 'Changing topic_id is not allowed' });
        }

        answer.answer_text = answer_text || answer.answer_text;
        answer.answered_by = answered_by || answer.answered_by;
        answer.status = status || answer.status;
        answer.updated_at = new Date();

        await answer.save({ transaction: t });
        await t.commit();
        res.json({ message: 'Answer updated', data: answer });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ message: 'Error updating answer', error: err.message });
    }
};

exports.deleteAnswer = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const answer = await TopicAnswer.findByPk(id, { transaction: t });
        if (!answer) {
            await t.rollback();
            return res.status(404).json({ message: 'Answer not found' });
        }

        await answer.destroy({ transaction: t });
        await t.commit();
        res.json({ message: 'Answer deleted' });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ message: 'Error deleting answer', error: err.message });
    }
};