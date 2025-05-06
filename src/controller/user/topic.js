const { Op } = require('sequelize');
const { sequelize, Topic, TopicAnswer } = require('../../models');

// ---------- Helper Functions ---------- //
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

const handleAnswers = async (answers, topicId, t) => {
    await TopicAnswer.destroy({ where: { topic_id: topicId }, transaction: t });

    const newAnswers = await Promise.all(
        answers.map(answer => TopicAnswer.create({
            topic_id: topicId,
            answer_text: answer.answer_text,
            answered_by: answer.answered_by,
            status: answer.status || 'hide',
            created_at: new Date(),
            updated_at: new Date()
        }, { transaction: t }))
    );
    return newAnswers;
};

// ---------- Controllers ---------- //
exports.getAllTopics = async (req, res) => {
    try {
        const { offset = 0, limit = 10, search = '' } = req.query;
        const parsedOffset = parseInt(offset);
        const parsedLimit = parseInt(limit);

        const where = {
            status: 'show',
            deleted_at: null,
            [Op.or]: [
                { title: { [Op.like]: `%${search}%` } },
                { posted_by: { [Op.like]: `%${search}%` } }
            ]
        };

        const totalCount = await Topic.count({ where });

        const topics = await Topic.findAll({
            where,
            offset: parsedOffset,
            limit: parsedLimit,
            order: [['created_at', 'DESC']],
            include: [{ model: TopicAnswer, as: 'answer' }]
        });

        const result = topics.map(topic => ({
            ...topic.toJSON(),
        }));

        res.status(200).json({
            data: result,
            pagination: generatePaginationLinks(req, parsedOffset, parsedLimit, totalCount, search)
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching topics', error: err.message });
    }
};

exports.getTopicById = async (req, res) => {
    try {
        const topic = await Topic.findOne({
            where: { id: req.params.id, status: 'show' },
            include: [{ model: TopicAnswer, as: 'answer' }]
        });

        if (!topic) return res.status(404).json({ message: 'Topic not found' });
        res.json(topic);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching topic', error: err.message });
    }
};


exports.updateTopic = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { answers } = req.body;

        const topic = await Topic.findByPk(id);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        if (answers) await handleAnswers(answers, id, t);

        const fullTopic = await Topic.findByPk(id, {
            include: [{ model: TopicAnswer, as: 'answer' }],
            transaction: t
        });

        await t.commit();
        res.json({ message: 'Topic updated', data: fullTopic });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ message: 'Error updating topic', error: err.message });
    }
};
