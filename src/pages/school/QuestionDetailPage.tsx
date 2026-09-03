import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { answerQuestion, getQuestion, resolveQuestion, type Question } from "../../api/questions";
import { uploadAttachments } from "../../api/attachments";
import { useAuth } from "../../contexts/auth";
import { AttachmentList } from "../../components/school/AttachmentList";
import { AttachmentPicker } from "../../components/school/AttachmentPicker";
import { attachmentsAreValid } from "../../utils/attachmentValidation";

export const QuestionDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [answerFiles, setAnswerFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const questionID = Number(id);

  const load = () => getQuestion(questionID).then(setQuestion).catch((reason: unknown) =>
    setError(reason instanceof Error ? reason.message : "質問を取得できませんでした"),
  );

  useEffect(() => {
    let active = true;
    getQuestion(questionID).then((item) => { if (active) setQuestion(item); }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "質問を取得できませんでした");
    });
    return () => { active = false; };
  }, [questionID]);

  if (error && !question) return <p className="min-h-dvh p-8 text-red-600">{error}</p>;
  if (!question) return <p className="min-h-dvh p-8 text-slate-900">読み込み中...</p>;
  const canAnswer = user?.role === "teacher" || user?.role === "admin";

  const submitAnswer = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const created = await answerQuestion(question.id, answer);
      await uploadAttachments("answers", created.id, answerFiles);
      setAnswer("");
      setAnswerFiles([]);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "回答できませんでした");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-dvh p-6 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <span className="text-sky-700">{question.category_name} → {question.department_name}</span>
        <h1 className="mt-2 text-2xl font-bold">{question.title}</h1>
        <p className="mt-4 whitespace-pre-wrap">{question.content}</p>
        <AttachmentList parent="questions" id={question.id} />
        <p className="mt-3 text-sm text-slate-500">質問者：{question.user_name}・{question.visibility === "private" ? "個別相談" : "公開質問"}</p>
        {question.answers?.map((item) => (
          <article key={item.id} className="mt-5 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
            <strong>{item.user_name}からの回答</strong>
            <p className="mt-2 whitespace-pre-wrap">{item.content}</p>
            <AttachmentList parent="answers" id={item.id} />
          </article>
        ))}
        {error && <p role="alert" className="mt-4 text-red-600">{error}</p>}
        {canAnswer && question.status !== "resolved" && (
          <form onSubmit={submitAnswer} className="mt-6 space-y-3">
            <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="回答を入力" className="w-full rounded border border-slate-300 bg-white p-3" />
            <AttachmentPicker files={answerFiles} onChange={setAnswerFiles} disabled={submitting} />
            <button disabled={submitting || !answer.trim() || !attachmentsAreValid(answerFiles)} className="rounded bg-sky-600 px-5 py-2 text-white disabled:opacity-40">{submitting ? "回答中..." : "回答する"}</button>
          </form>
        )}
        {user?.id === question.user_id && question.status !== "resolved" && <button onClick={async () => { await resolveQuestion(question.id); await load(); }} className="mt-6 rounded bg-emerald-700 px-5 py-2 text-white">解決しました</button>}
        {question.status === "resolved" && <p className="mt-6 font-bold text-emerald-700">✓ 解決済み</p>}
      </div>
    </main>
  );
};
