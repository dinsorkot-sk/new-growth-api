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