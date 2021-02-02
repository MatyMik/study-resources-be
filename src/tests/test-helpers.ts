import * as bcrypt from 'bcrypt-nodejs';
import {
  password,
  testEmail,
  articleTitle,
  topicTitle,
  fileName,
  url,
  numPages,
  lastPageRead,
  youtubeTitle,
  pdfTitle,
  courseTitle,
  sectionTitle,
  videoTitle,
} from './test-data';

const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSaltSync(10);
  const hashedP: string = await bcrypt.hashSync(password, salt);
  return hashedP;
};

export const createOneTopic = async (repo) => {
  const hashedPassword = await hashPassword(password);
  await repo.query(
    `INSERT INTO public."user"(email, password) VALUES('${testEmail}', '${hashedPassword}');`,
  );

  const [savedUser] = await repo.query(
    `SELECT id FROM public."user"
      WHERE email = '${testEmail}';`,
  );
  await repo.query(
    `INSERT INTO public.topic(title, "userId") VALUES('${topicTitle}', ${savedUser.id});`,
  );
  const [savedTopic] = await repo.query(
    `SELECT id, title, "lastActive", "userId" FROM public.topic 
      WHERE title = '${topicTitle}';`,
  );

  return savedTopic;
};

export const saveOneArticleToTopic = async (repo) => {
  const savedTopic = await createOneTopic(repo);

  await repo.query(
    `INSERT INTO public.article(title, "topicId", url) VALUES('${articleTitle}', ${savedTopic.id}, '${url}');`,
  );

  const [
    savedArticle,
  ] = await repo.query(`SELECT id, url, title, "lastActive", archived FROM public.article 
  WHERE title = '${articleTitle}' AND "topicId" = ${savedTopic.id};`);

  return [savedTopic, savedArticle];
};

export const saveOnePdfToTopic = async (repo) => {
  const savedTopic = await createOneTopic(repo);

  await repo.query(
    `INSERT INTO public.pdf(title, "topicId", "lastPageRead", "numPages", url) 
    VALUES('${fileName}', ${savedTopic.id}, ${lastPageRead}, ${numPages}, '${url}');`,
  );

  const [
    savedPdf,
  ] = await repo.query(`SELECT id, title, "topicId", "lastPageRead", "numPages", url, archived FROM public.pdf 
    WHERE "title" = '${fileName}' AND "topicId" = ${savedTopic.id};`);

  return [savedTopic, savedPdf];
};

export const saveMultipleArticlesToTopic = async (repo) => {
  const savedTopic = await createOneTopic(repo);

  await repo.query(
    `INSERT INTO public.article(title, url, "topicId") 
    VALUES('${articleTitle}', '${url}', ${savedTopic.id});`,
  );

  await repo.query(
    `INSERT INTO public.article(title, url, "topicId") 
    VALUES('${articleTitle}', '${url}', ${savedTopic.id});`,
  );

  await repo.query(
    `INSERT INTO public.article(title, url, "topicId") 
    VALUES('${articleTitle}', '${url}', ${savedTopic.id});`,
  );

  await repo.query(
    `INSERT INTO public.article(title, url, "topicId") 
    VALUES('${articleTitle}', '${url}', ${savedTopic.id});`,
  );

  const savedArticles = await repo.query(`SELECT id, title, url, "lastActive", archived FROM public.article 
    WHERE "topicId" = ${savedTopic.id}
    ORDER BY "lastActive" DESC;`);

  return [savedTopic, savedArticles];
};

export const saveOneYoutubeLinkToTopic = async (repo) => {
  const savedTopic = await createOneTopic(repo);

  await repo.query(
    `INSERT INTO public.youtube(title, "topicId", url) VALUES('${youtubeTitle}', ${savedTopic.id}, '${url}');`,
  );

  const [
    savedYoutubeLink,
  ] = await repo.query(`SELECT id, url, title, "lastActive", archived FROM public.youtube 
  WHERE title = '${youtubeTitle}' AND "topicId" = ${savedTopic.id};`);

  return [savedTopic, savedYoutubeLink];
};

export const saveMultipleYoutubeLinksToTopic = async (repo) => {
  const savedTopic = await createOneTopic(repo);

  await repo.query(
    `INSERT INTO public.youtube(title, url, "topicId") 
    VALUES('${youtubeTitle}', '${url}', ${savedTopic.id});`,
  );

  await repo.query(
    `INSERT INTO public.youtube(title, url, "topicId") 
    VALUES('${youtubeTitle}', '${url}', ${savedTopic.id});`,
  );

  await repo.query(
    `INSERT INTO public.youtube(title, url, "topicId") 
    VALUES('${youtubeTitle}', '${url}', ${savedTopic.id});`,
  );

  await repo.query(
    `INSERT INTO public.youtube(title, url, "topicId") 
    VALUES('${youtubeTitle}', '${url}', ${savedTopic.id});`,
  );

  const savedYoutubeLinks = await repo.query(`SELECT id, title, url, "lastActive", archived FROM public.youtube 
    WHERE "topicId" = ${savedTopic.id}
    ORDER BY "lastActive" DESC;`);

  return [savedTopic, savedYoutubeLinks];
};

export const saveMultiplePdfsToTopic = async (repo) => {
  const savedTopic = await createOneTopic(repo);

  await repo.query(
    `INSERT INTO public.pdf(title, url, "topicId", "numPages") 
    VALUES('${pdfTitle}', '${url}', ${savedTopic.id}, ${numPages});`,
  );

  await repo.query(
    `INSERT INTO public.pdf(title, url, "topicId", "numPages") 
    VALUES('${pdfTitle}', '${url}', ${savedTopic.id}, ${numPages});`,
  );

  await repo.query(
    `INSERT INTO public.pdf(title, url, "topicId", "numPages") 
    VALUES('${pdfTitle}', '${url}', ${savedTopic.id}, ${numPages});`,
  );

  await repo.query(
    `INSERT INTO public.pdf(title, url, "topicId", "numPages") 
    VALUES('${pdfTitle}', '${url}', ${savedTopic.id}, ${numPages});`,
  );

  const savedPdfs = await repo.query(`SELECT id, title, url, "lastActive", "numPages", "lastPageRead", archived FROM public.pdf 
    WHERE "topicId" = ${savedTopic.id}
    ORDER BY "lastActive" DESC;`);

  return [savedTopic, savedPdfs];
};

export const saveOneCourseToTopic = async (repo) => {
  const savedTopic = await createOneTopic(repo);

  await repo.query(
    `INSERT INTO public.course(title, "topicId") 
    VALUES('${courseTitle}', ${savedTopic.id});`,
  );

  const [
    savedCourse,
  ] = await repo.query(`SELECT id, title, "topicId", archived FROM public.course 
    WHERE "title" = '${courseTitle}' AND "topicId" = ${savedTopic.id};`);

  return [savedTopic, savedCourse];
};

export const saveOneCourseSectionVideoToTopic = async (repo) => {
  const savedTopic = await createOneTopic(repo);

  await repo.query(
    `INSERT INTO public.course(title, "topicId") 
    VALUES('${courseTitle}', ${savedTopic.id});`,
  );

  const [
    savedCourse,
  ] = await repo.query(`SELECT id, title, "topicId", archived FROM public.course 
    WHERE "title" = '${courseTitle}' AND "topicId" = ${savedTopic.id};`);
  // console.log(savedCourse);

  await repo.query(
    `INSERT INTO public.section(title, "courseId", "order") 
    VALUES('${sectionTitle}', ${savedCourse.id}, 1);`,
  );

  const [
    savedSection,
  ] = await repo.query(`SELECT id, title, "courseId", "order" FROM public.section 
  WHERE "title" = '${sectionTitle}' AND "courseId" = ${savedCourse.id};`);

  await repo.query(
    `INSERT INTO public.video(title, "sectionId", "order", url) 
    VALUES('${videoTitle}', ${savedSection.id}, 1, '${url}');`,
  );

  const [
    savedVideo,
  ] = await repo.query(`SELECT id, title, "sectionId", "order" FROM public.video 
  WHERE "title" = '${videoTitle}' AND "sectionId" = ${savedSection.id};`);

  return { course: savedCourse, video: savedVideo, section: savedSection };
};

export const getSavedCourse = async (repo, courseId) => {
  const [
    savedCourse,
  ] = await repo.query(`SELECT id, title, "topicId", archived FROM public.course 
    WHERE id = '${courseId}';`);

  const [
    savedSection,
  ] = await repo.query(`SELECT id, title, "courseId", "order" FROM public.section 
    WHERE "title" = '${sectionTitle}' AND "courseId" = ${savedCourse.id};`);

  const [
    savedVideo,
  ] = await repo.query(`SELECT id, title, "sectionId", "order", url FROM public.video 
    WHERE "title" = '${videoTitle}' AND "sectionId" = ${savedSection.id};`);

  return { course: savedCourse, section: savedSection, video: savedVideo };
};

export const saveMiltipleCoursesToTopic = async (repo) => {
  const savedTopic = await createOneTopic(repo);

  await repo.query(
    `INSERT INTO public.course(title, "topicId") 
    VALUES('${courseTitle}', ${savedTopic.id});`,
  );

  await repo.query(
    `INSERT INTO public.course(title, "topicId") 
    VALUES('${courseTitle}', ${savedTopic.id});`,
  );
  await repo.query(
    `INSERT INTO public.course(title, "topicId") 
    VALUES('${courseTitle}', ${savedTopic.id});`,
  );
  await repo.query(
    `INSERT INTO public.course(title, "topicId") 
    VALUES('${courseTitle}', ${savedTopic.id});`,
  );
  await repo.query(
    `INSERT INTO public.course(title, "topicId") 
    VALUES('${courseTitle}', ${savedTopic.id});`,
  );
  const savedCourses = await repo.query(`SELECT id, title, archived, "lastActive", "lastWatched", "totalItems" FROM public.course 
    WHERE "topicId" = ${savedTopic.id};`);

  return [savedTopic, savedCourses];
};

export const saveOneSectionToCourse = async (repo) => {
  const [topic, course] = await saveOneCourseToTopic(repo);

  await repo.query(
    `INSERT INTO public.section(title, "courseId", "order") 
    VALUES('${sectionTitle}', ${course.id}, 1);`,
  );

  const [
    savedSection,
  ] = await repo.query(`SELECT id, title, "courseId", "order" FROM public.section 
    WHERE "title" = '${sectionTitle}' AND "courseId" = ${course.id};`);

  return [course, savedSection];
};
