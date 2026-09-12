import { db } from './index.ts';
import {
  curriculumStandards,
  textbookKnowledgeNodes,
  studentMisconceptions,
  teachingScaffolds,
  lessonDiagnoses,
} from './schema.ts';
import { eq, ilike, or, sql, desc } from 'drizzle-orm';

/**
 * 知识库数据库统计信息
 */
export async function getKnowledgeStats() {
  try {
    const [standardsCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(curriculumStandards);
    const [nodesCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(textbookKnowledgeNodes);
    const [misconceptionsCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(studentMisconceptions);
    const [scaffoldsCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(teachingScaffolds);
    const [diagnosesCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(lessonDiagnoses);

    return {
      curriculumStandards: standardsCount?.count || 0,
      textbookKnowledgeNodes: nodesCount?.count || 0,
      studentMisconceptions: misconceptionsCount?.count || 0,
      teachingScaffolds: scaffoldsCount?.count || 0,
      lessonDiagnoses: diagnosesCount?.count || 0,
      engine: 'PostgreSQL (Cloud SQL)',
      status: 'Connected & Active',
    };
  } catch (error) {
    console.error('Failed to get knowledge stats from SQL:', error);
    return {
      curriculumStandards: 0,
      textbookKnowledgeNodes: 0,
      studentMisconceptions: 0,
      teachingScaffolds: 0,
      lessonDiagnoses: 0,
      engine: 'PostgreSQL (Cloud SQL)',
      status: 'Error: ' + (error as Error).message,
    };
  }
}

/**
 * 多路检索匹配教案相关的课程标准、教材图谱节点、易错点与特级名师支架
 */
export async function retrieveComprehensiveKnowledgeFromSql(
  lessonTitle: string,
  subjectHint: string,
  stageHint: string
) {
  try {
    const cleanTitle = lessonTitle.replace(/[《》]/g, '').trim();

    // 1. 检索课程标准 (按学科和学段)
    let standards = await db
      .select()
      .from(curriculumStandards)
      .where(
        or(
          ilike(curriculumStandards.subject, `%${subjectHint}%`),
          ilike(curriculumStandards.bigIdeas, `%${cleanTitle}%`),
          ilike(curriculumStandards.coreCompetencies, `%${cleanTitle}%`)
        )
      )
      .limit(3);

    if (standards.length === 0) {
      standards = await db.select().from(curriculumStandards).limit(2);
    }

    // 2. 检索教材知识节点
    let nodes = await db
      .select()
      .from(textbookKnowledgeNodes)
      .where(
        or(
          ilike(textbookKnowledgeNodes.lessonTitle, `%${cleanTitle}%`),
          ilike(textbookKnowledgeNodes.unitTitle, `%${cleanTitle}%`),
          ilike(textbookKnowledgeNodes.subject, `%${subjectHint}%`)
        )
      )
      .limit(3);

    // 3. 检索学生典型认知障碍
    let misconceptions = await db
      .select()
      .from(studentMisconceptions)
      .where(
        or(
          ilike(studentMisconceptions.topic, `%${cleanTitle}%`),
          ilike(studentMisconceptions.subject, `%${subjectHint}%`)
        )
      )
      .limit(4);

    // 4. 检索特级名师逆向支架与量规
    let scaffolds = await db
      .select()
      .from(teachingScaffolds)
      .where(
        or(
          ilike(teachingScaffolds.topic, `%${cleanTitle}%`),
          ilike(teachingScaffolds.subject, `%${subjectHint}%`)
        )
      )
      .limit(4);

    return {
      standards,
      nodes,
      misconceptions,
      scaffolds,
      dataSource: 'Cloud SQL (PostgreSQL)',
    };
  } catch (error) {
    console.error('Failed to query knowledge from Cloud SQL:', error);
    throw new Error('知识库检索异常', { cause: error });
  }
}

/**
 * 保存教案诊断优化记录至数据库
 */
export async function saveLessonDiagnosisToSql(record: {
  userId?: number;
  lessonTitle: string;
  subject: string;
  gradeStage: string;
  originalPlan: string;
  diagnosisReport: string;
  reconstructedPlan: string;
  score: number;
}) {
  try {
    const [inserted] = await db
      .insert(lessonDiagnoses)
      .values({
        userId: record.userId || null,
        lessonTitle: record.lessonTitle,
        subject: record.subject,
        gradeStage: record.gradeStage,
        originalPlan: record.originalPlan,
        diagnosisReport: record.diagnosisReport,
        reconstructedPlan: record.reconstructedPlan,
        score: record.score,
      })
      .returning();

    return inserted;
  } catch (error) {
    console.error('Failed to save lesson diagnosis to SQL:', error);
    throw new Error('保存诊断记录失败', { cause: error });
  }
}

/**
 * 获取近期教案诊断记录
 */
export async function getRecentDiagnoses(limitCount: number = 10) {
  try {
    return await db
      .select()
      .from(lessonDiagnoses)
      .orderBy(desc(lessonDiagnoses.createdAt))
      .limit(limitCount);
  } catch (error) {
    console.error('Failed to get recent diagnoses:', error);
    return [];
  }
}
