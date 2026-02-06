'use client';

interface ErrorMessageCellProps {
  errorMessage: string | null;
}

export function ErrorMessageCell({ errorMessage }: ErrorMessageCellProps) {
  if (!errorMessage) {
    return <span className="text-xs text-muted-foreground">-</span>;
  }

  const truncated = errorMessage.length > 100;
  const displayMessage = truncated
    ? errorMessage.substring(0, 100) + '...'
    : errorMessage;

  const handleShowFull = () => {
    // Create a better formatted alert message
    const message = `에러 메시지:\n\n${errorMessage}\n\n클릭하여 닫기`;
    alert(message);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(errorMessage);
      alert('에러 메시지가 클립보드에 복사되었습니다.');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-md">
      <div className="text-xs text-red-600 font-mono break-words">
        {displayMessage}
      </div>
      <div className="mt-1 flex gap-2">
        {truncated && (
          <button
            onClick={handleShowFull}
            className="text-xs text-blue-600 hover:underline"
          >
            전체 보기
          </button>
        )}
        <button
          onClick={handleCopy}
          className="text-xs text-blue-600 hover:underline"
        >
          복사
        </button>
      </div>
    </div>
  );
}
