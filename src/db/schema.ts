import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. 用户表 (集成 Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('teacher'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. 课程标准与素养指标表 (Curriculum Standards)
export const curriculumStandards = pgTable('curriculum_standards', {
  id: serial('id').primaryKey(),
  subject: text('subject').notNull(), // 语文, 数学, 道德与法治, 地理, 物理, 综合实践...
  stage: text('stage').notNull(), // 小学, 初中, 高中
  grade: text('grade').notNull(), // 如: 1-2年级, 7-9年级
  coreCompetencies: text('core_competencies').notNull(), // 核心素养指标
  bigIdeas: text('big_ideas').notNull(), // 学科大观念/学习任务群
  qualityStandards: text('quality_standards').notNull(), // 学业质量标准与表现要求
  benchmarkCode: text('benchmark_code'), // 课标代码标识
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. 全国教材课时知识图谱表 (Textbook Knowledge Nodes)
export const textbookKnowledgeNodes = pgTable('textbook_knowledge_nodes', {
  id: serial('id').primaryKey(),
  subject: text('subject').notNull(),
  version: text('version').notNull(), // 统编版/人教版, 北师大版, 苏教版...
  gradeStage: text('grade_stage').notNull(), // 如: 一年级上册, 八年级下册
  unitTitle: text('unit_title').notNull(), // 单元主题
  lessonTitle: text('lesson_title').notNull(), // 课题名称
  prerequisites: text('prerequisites'), // 前驱必备学情
  coreObjectives: text('core_objectives').notNull(), // 课时核心教学目标
  keyFocus: text('key_focus').notNull(), // 教学重点
  difficulty: text('difficulty').notNull(), // 教学难点
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. 学生认知障碍与易错归因表 (Student Misconceptions)
export const studentMisconceptions = pgTable('student_misconceptions', {
  id: serial('id').primaryKey(),
  subject: text('subject').notNull(),
  gradeStage: text('grade_stage').notNull(),
  topic: text('topic').notNull(), // 课题或核心概念
  misconceptionTitle: text('misconception_title').notNull(), // 典型认知误区
  typicalSymptom: text('typical_symptom').notNull(), // 学生典型课堂错误表现与原话
  rootCause: text('root_cause').notNull(), // 认知心理归因
  interventionStrategy: text('intervention_strategy').notNull(), // 特级教师突破支架
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. 特级名师逆向支架与评价量规表 (Teaching Scaffolds & Rubrics)
export const teachingScaffolds = pgTable('teaching_scaffolds', {
  id: serial('id').primaryKey(),
  subject: text('subject').notNull(),
  gradeStage: text('grade_stage').notNull(),
  topic: text('topic').notNull(),
  scaffoldType: text('scaffold_type').notNull(), // rubric (三星表现性评价量规), inquiry_chain (追问链), blackboard_design (特级板书)
  title: text('title').notNull(),
  content: text('content').notNull(), // 结构化支架内容
  expertPedagogy: text('expert_pedagogy'), // 教学法要领
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. 教师教案诊断与优化记录表 (Lesson Diagnoses)
export const lessonDiagnoses = pgTable('lesson_diagnoses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  lessonTitle: text('lesson_title').notNull(),
  subject: text('subject').notNull(),
  gradeStage: text('grade_stage').notNull(),
  originalPlan: text('original_plan').notNull(), // 教师输入初稿
  diagnosisReport: text('diagnosis_report').notNull(), // 诊断测评及扣分归因
  reconstructedPlan: text('reconstructed_plan').notNull(), // 特级重构方案
  score: integer('score').default(85), // 综合素养得分
  createdAt: timestamp('created_at').defaultNow(),
});

// 关联关系定义
export const usersRelations = relations(users, ({ many }) => ({
  diagnoses: many(lessonDiagnoses),
}));

export const lessonDiagnosesRelations = relations(lessonDiagnoses, ({ one }) => ({
  user: one(users, {
    fields: [lessonDiagnoses.userId],
    references: [users.id],
  }),
}));
