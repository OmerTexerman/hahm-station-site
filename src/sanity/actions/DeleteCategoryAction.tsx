import { useCallback, useEffect, useState } from "react";
import {
  type DocumentActionDescription,
  type DocumentActionProps,
  useClient,
  useDocumentOperation,
} from "sanity";
import { TrashIcon } from "@sanity/icons";

type CategoryOption = { _id: string; title: string };

export function DeleteCategoryAction(
  props: DocumentActionProps
): DocumentActionDescription | null {
  const { id, type, published, draft, onComplete } = props;
  const client = useClient({ apiVersion: "2024-01-01" });
  const { delete: deleteOp } = useDocumentOperation(id, type);

  const [showConfirm, setShowConfirm] = useState(false);
  const [postCount, setPostCount] = useState<number | null>(null);
  const [otherCategories, setOtherCategories] = useState<CategoryOption[]>([]);
  const [targetCategory, setTargetCategory] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch post count and other categories when dialog opens
  useEffect(() => {
    if (!showConfirm) return;

    const fetchData = async () => {
      const [count, categories] = await Promise.all([
        client.fetch<number>(
          `count(*[_type == "post" && category._ref == $id])`,
          { id }
        ),
        client.fetch<CategoryOption[]>(
          `*[_type == "category" && _id != $id]{ _id, title } | order(title asc)`,
          { id }
        ),
      ]);
      setPostCount(count);
      setOtherCategories(categories);
    };
    fetchData();
  }, [showConfirm, client, id]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      // Handle posts that belong to this category
      if (postCount && postCount > 0) {
        const postIds = await client.fetch<string[]>(
          `*[_type == "post" && category._ref == $id]._id`,
          { id }
        );

        const tx = client.transaction();
        if (targetCategory) {
          // Reassign posts to the chosen category
          for (const postId of postIds) {
            tx.patch(postId, (p) =>
              p.set({ category: { _type: "reference", _ref: targetCategory } })
            );
            tx.patch(`drafts.${postId}`, (p) =>
              p.set({ category: { _type: "reference", _ref: targetCategory } })
            );
          }
        } else {
          // Delete posts and their drafts
          for (const postId of postIds) {
            tx.delete(postId);
            tx.delete(`drafts.${postId}`);
          }
        }
        await tx.commit();
      }

      // Clear any homeScreenSettings references to this category
      const homeSettings = await client.fetch<
        { _id: string; metronomeCategory?: { _ref: string }; vinylCategory?: { _ref: string }; plantCategory?: { _ref: string } } | null
      >(
        `*[_type == "homeScreenSettings"][0]{
          _id,
          metronomeCategory,
          vinylCategory,
          plantCategory
        }`
      );

      if (homeSettings) {
        const unsets: string[] = [];
        if (homeSettings.metronomeCategory?._ref === id)
          unsets.push("metronomeCategory");
        if (homeSettings.vinylCategory?._ref === id)
          unsets.push("vinylCategory");
        if (homeSettings.plantCategory?._ref === id)
          unsets.push("plantCategory");

        if (unsets.length > 0) {
          await client
            .patch(homeSettings._id)
            .unset(unsets)
            .commit();
        }
      }

      // Delete the category
      deleteOp.execute();
      onComplete();
    } catch (err) {
      console.error("Failed to delete category:", err);
      setIsDeleting(false);
    }
  }, [client, id, targetCategory, postCount, deleteOp, onComplete]);

  if (!published && !draft) return null;

  return {
    label: "Delete",
    icon: TrashIcon,
    tone: "critical",
    onHandle: () => {
      setShowConfirm(true);
      setPostCount(null);
      setTargetCategory("");
      setIsDeleting(false);
    },
    dialog: showConfirm
      ? {
          type: "confirm",
          tone: "critical",
          onCancel: () => {
            setShowConfirm(false);
            onComplete();
          },
          onConfirm: handleDelete,
          message: (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {postCount === null ? (
                <p>Checking for posts in this category...</p>
              ) : postCount === 0 ? (
                <p>
                  No posts belong to this category. It's safe to delete.
                </p>
              ) : (
                <>
                  <p>
                    <strong>{postCount} post{postCount === 1 ? "" : "s"}</strong>{" "}
                    belong{postCount === 1 ? "s" : ""} to this category.
                  </p>
                  {otherCategories.length > 0 ? (
                    <>
                      <p>Move them to another category before deleting:</p>
                      <select
                        value={targetCategory}
                        onChange={(e) => setTargetCategory(e.target.value)}
                        style={{
                          padding: "8px 12px",
                          fontSize: 14,
                          borderRadius: 4,
                          border: "1px solid var(--card-border-color)",
                          background: "var(--card-bg-color)",
                          color: "var(--card-fg-color)",
                        }}
                      >
                        <option value="">
                          Don't move — delete posts too
                        </option>
                        {otherCategories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.title}
                          </option>
                        ))}
                      </select>
                      {!targetCategory && (
                        <p style={{ color: "var(--card-badge-caution-fg-color)" }}>
                          Posts will be permanently deleted along with this
                          category.
                        </p>
                      )}
                    </>
                  ) : (
                    <p style={{ color: "var(--card-badge-caution-fg-color)" }}>
                      No other categories exist. Posts will be permanently
                      deleted along with this category.
                    </p>
                  )}
                </>
              )}
              {isDeleting && <p>Deleting...</p>}
            </div>
          ),
        }
      : undefined,
  };
}
