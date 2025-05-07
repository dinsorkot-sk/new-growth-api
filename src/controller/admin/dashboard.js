const { User, Course, TopicAnswer, Review, News } = require('../../models');

exports.getDashboardData = async (req, res) => {
    try {
        const [users, courses, answers, reviews, news] = await Promise.all([
            User.findAll({ raw: true }),
            Course.findAll({ raw: true }),
            TopicAnswer.findAll({ raw: true }),
            Review.findAll({ raw: true }),
            News.findAll({ raw: true })
        ]);

        const today = new Date().toISOString().split('T')[0];

        // คำนวณวันที่เริ่มต้นและสิ้นสุดของเดือนที่แล้ว
        const firstDayLastMonth = new Date();
        firstDayLastMonth.setMonth(firstDayLastMonth.getMonth() - 1);
        firstDayLastMonth.setDate(1);
        const lastDayLastMonth = new Date(firstDayLastMonth);
        lastDayLastMonth.setMonth(lastDayLastMonth.getMonth() + 1);
        lastDayLastMonth.setDate(0);
        const firstDayLastMonthISO = firstDayLastMonth.toISOString().split('T')[0];
        const lastDayLastMonthISO = lastDayLastMonth.toISOString().split('T')[0];

        // คำนวณจำนวนผู้เข้าใช้งานในวันนี้
        const todayVisitors = users.filter(user => {
            const lastLoginDate = user.lastLogin ? new Date(user.lastLogin).toISOString().split('T')[0] : null;
            return lastLoginDate === today;
        }).length;

        // คำนวณจำนวนผู้เข้าใช้งานในเดือนนี้
        const thisMonthVisitors = users.filter(user => {
            const lastLoginDate = user.lastLogin ? new Date(user.lastLogin).toISOString().split('T')[0] : null;
            return lastLoginDate >= today.substring(0, 7) + "-01";  // วันที่เริ่มต้นของเดือนนี้
        }).length;

        // คำนวณจำนวนผู้เข้าใช้งานในเดือนที่แล้ว
        const lastMonthVisitors = users.filter(user => {
            const lastLoginDate = user.lastLogin ? new Date(user.lastLogin).toISOString().split('T')[0] : null;
            return lastLoginDate >= firstDayLastMonthISO && lastLoginDate <= lastDayLastMonthISO;
        }).length;

        // คำนวณเปอร์เซ็นต์การเปลี่ยนแปลงระหว่างเดือนนี้และเดือนที่แล้ว
        let changePercentage = 0;
        if (lastMonthVisitors > 0) {
            changePercentage = ((thisMonthVisitors - lastMonthVisitors) / lastMonthVisitors) * 100;
        }

        // คำนวณข้อความใหม่ในวันนี้
        const todayMessages = [...answers, ...reviews].filter(item => {
            const createdDate = item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : null;
            return createdDate === today;
        }).length;

        // คำนวณกิจกรรมใหม่ในวันนี้
        const todayActivities = news.filter(n => {
            const newsDate = n.date ? new Date(n.date).toISOString().split('T')[0] : null;
            return newsDate === today;
        }).length;

        const monthlyUsers = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const month = date.toISOString().slice(0, 7); // YYYY-MM

            const count = users.filter(u => {
                const userMonth = u.created_at?.toISOString().slice(0, 7);
                return userMonth === month;
            }).length;

            return { month, count };
        }).reverse();

        const data = {
            visitorCount: todayVisitors, // จำนวนผู้เข้าใช้งานวันนี้
            courseCount: courses.length,  // จำนวนหลักสูตร
            newMessages: todayMessages,  // จำนวนข้อความใหม่
            todayActivities: todayActivities,  // จำนวนกิจกรรมใหม่
            visitorsComparison: {
                thisMonth: thisMonthVisitors,  // จำนวนผู้เข้าใช้งานในเดือนนี้
                lastMonth: lastMonthVisitors,  // จำนวนผู้เข้าใช้งานในเดือนที่แล้ว
                change: changePercentage.toFixed(2)  // การเปลี่ยนแปลงในรูปเปอร์เซ็นต์
            },
            courses: courses.map(course => ({
                id: course.id,
                name: course.name,
                students: course.students || 0
            })),
            latestMessages: [...answers, ...reviews]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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
