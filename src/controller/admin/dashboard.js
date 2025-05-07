const { User, Course, TopicAnswer, Review, News } = require('../../models');

exports.getDashboardData = async (req, res) => {
    try {
        const [users, courses, answers, reviews, news] = await Promise.all([
            User.findAll({ raw: true }),
            Course.findAll({
                include: [
                    { model: Review, as: 'review' }
                ],
                nest: true // ทำให้ course.review เป็น array จริง
            }),
            TopicAnswer.findAll({ raw: true }),
            Review.findAll({ raw: true }),
            News.findAll({ raw: true })
        ]);

        const today = new Date().toISOString().split('T')[0];

        const firstDayLastMonth = new Date();
        firstDayLastMonth.setMonth(firstDayLastMonth.getMonth() - 1);
        firstDayLastMonth.setDate(1);

        const lastDayLastMonth = new Date(firstDayLastMonth);
        lastDayLastMonth.setMonth(lastDayLastMonth.getMonth() + 1);
        lastDayLastMonth.setDate(0);

        const firstDayLastMonthISO = firstDayLastMonth.toISOString().split('T')[0];
        const lastDayLastMonthISO = lastDayLastMonth.toISOString().split('T')[0];

        const todayVisitors = users.filter(user => {
            const created = user.created_at && new Date(user.created_at).toISOString().split('T')[0];
            return created === today;
        }).length;

        const thisMonthVisitors = users.filter(user => {
            const created = user.created_at && new Date(user.created_at).toISOString().split('T')[0];
            return created >= today.slice(0, 7) + "-01";
        }).length;

        const lastMonthVisitors = users.filter(user => {
            const login = user.lastLogin && new Date(user.lastLogin).toISOString().split('T')[0];
            return login >= firstDayLastMonthISO && login <= lastDayLastMonthISO;
        }).length;

        let changePercentage = 0;
        if (lastMonthVisitors > 0) {
            changePercentage = ((thisMonthVisitors - lastMonthVisitors) / lastMonthVisitors) * 100;
        } else if (thisMonthVisitors > 0) {
            changePercentage = 100;
        }

        const todayMessages = [...answers, ...reviews].filter(item => {
            const created = item.created_at && new Date(item.created_at).toISOString().split('T')[0];
            return created === today;
        }).length;

        const todayActivities = news.filter(n => {
            const date = n.date && new Date(n.date).toISOString().split('T')[0];
            return date === today;
        }).length;

        const monthlyUsers = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const month = date.toISOString().slice(0, 7);

            const count = users.filter(u => {
                const userMonth = u.created_at && new Date(u.created_at).toISOString().slice(0, 7);
                return userMonth === month;
            }).length;

            return { month, count };
        }).reverse();

        const data = {
            visitorCount: todayVisitors,
            courseCount: courses.length,
            newMessages: todayMessages,
            todayActivities,
            visitorsComparison: {
                thisMonth: thisMonthVisitors,
                lastMonth: lastMonthVisitors,
                change: changePercentage.toFixed(2)
            },
            courses: courses.map(course => {
                const reviews = Array.isArray(course.review) ? course.review : [];
                const totalScore = reviews.reduce((sum, r) => sum + (parseFloat(r.score) || 0), 0);
                const avgScore = reviews.length > 0 ? (totalScore / reviews.length).toFixed(2) : "0.00";

                return {
                    id: course.id,
                    name: course.name,
                    score: avgScore
                };
            }),
            latestMessages: [...answers, ...reviews]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5),
            latestActivities: news
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5),
            monthlyUsers
        };

        res.status(200).json(data);
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
