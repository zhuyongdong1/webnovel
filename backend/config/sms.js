const Core = require('@alicloud/pop-core');

// 检查必要的环境变量
const requiredEnvVars = [
    'ALIYUN_ACCESS_KEY_ID',
    'ALIYUN_ACCESS_KEY_SECRET',
    'ALIYUN_SMS_SIGN_NAME',
    'ALIYUN_SMS_TEMPLATE_REGISTER',
    'ALIYUN_SMS_TEMPLATE_LOGIN'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    console.warn('警告：以下环境变量未设置：', missingEnvVars.join(', '));
    console.warn('短信服务将无法正常工作，请检查 .env 文件配置');
}

const client = new Core({
    accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || 'dummy',
    accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || 'dummy',
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2017-05-25'
});

const sendSms = async (phone, code, type) => {
    // 检查环境变量是否配置
    if (missingEnvVars.length > 0) {
        console.log('模拟发送短信：', { phone, code, type });
        return { Code: 'OK', Message: '模拟发送成功' };
    }

    const params = {
        PhoneNumbers: phone,
        SignName: process.env.ALIYUN_SMS_SIGN_NAME,
        TemplateCode: type === 1 ? process.env.ALIYUN_SMS_TEMPLATE_REGISTER : process.env.ALIYUN_SMS_TEMPLATE_LOGIN,
        TemplateParam: JSON.stringify({ code })
    };

    try {
        const result = await client.request('SendSms', params, { method: 'POST' });
        return result;
    } catch (error) {
        console.error('发送短信失败:', error);
        throw error;
    }
};

module.exports = {
    sendSms
}; 